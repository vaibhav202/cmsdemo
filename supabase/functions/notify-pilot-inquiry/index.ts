import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const notificationTable = "pilot_inquiry_notifications"
const webhookSecretHeader = "x-pilot-inquiry-webhook-secret"
const maximumPayloadBytes = 64 * 1024
const smtpTimeoutMs = 15_000
const staleAttemptMs = 15 * 60 * 1_000

const emailPattern = /^[^@\s<>]+@[^@\s<>]+\.[^@\s<>]+$/u
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu

type NotificationStatus = "pending" | "sending" | "sent" | "failed"

type InquiryRecord = {
  id: string
  name: string
  email: string
  businessName: string
  phone: string | null
  city: string | null
  message: string | null
}

type NotificationRow = {
  inquiry_id: string
  status: NotificationStatus
  attempts: number
  last_attempt_at: string | null
}

type SmtpConfig = {
  host: string
  port: number
  user: string
  password: string
  from: string
  to: string
}

type SmtpConnection = {
  read(buffer: Uint8Array): Promise<number | null>
  write(buffer: Uint8Array): Promise<number>
  close(): void
}

type SmtpResponse = {
  code: number
  lines: string[]
}

type AdminClient = SupabaseClient

class InvalidPayloadError extends Error {
  constructor() {
    super("invalid webhook payload")
    this.name = "InvalidPayloadError"
  }
}

class ConfigurationError extends Error {
  constructor() {
    super("notification configuration is incomplete")
    this.name = "ConfigurationError"
  }
}

class SmtpError extends Error {
  readonly reason: string
  readonly responseCode: number | undefined

  constructor(reason: string, responseCode?: number) {
    super(reason)
    this.name = "SmtpError"
    this.reason = reason
    this.responseCode = responseCode
  }
}

function jsonResponse(status: number, body: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  })
}

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function readTextField(
  record: Record<string, unknown>,
  key: string,
  maximumLength: number,
  required: boolean,
) {
  const value = record[key]

  if (value === null || value === undefined) {
    if (required) throw new InvalidPayloadError()
    return null
  }

  if (typeof value !== "string") throw new InvalidPayloadError()

  const normalized = value.trim()
  if (required && normalized.length === 0) throw new InvalidPayloadError()
  if (normalized.length > maximumLength) throw new InvalidPayloadError()

  return normalized || null
}

function parseWebhookPayload(value: unknown): InquiryRecord {
  const payload = asObject(value)
  if (
    !payload ||
    payload.type !== "INSERT" ||
    payload.schema !== "public" ||
    payload.table !== "pilot_inquiries"
  ) {
    throw new InvalidPayloadError()
  }

  const record = asObject(payload.record)
  if (!record) throw new InvalidPayloadError()

  const id = readTextField(record, "id", 36, true)
  const name = readTextField(record, "name", 80, true)
  const email = readTextField(record, "email", 254, true)
  const businessName = readTextField(record, "business_name", 120, true)
  const phone = readTextField(record, "phone", 30, false)
  const city = readTextField(record, "city", 80, false)
  const message = readTextField(record, "message", 1_000, false)

  if (
    !id ||
    !uuidPattern.test(id) ||
    !name ||
    name.length < 2 ||
    !email ||
    !emailPattern.test(email) ||
    !businessName ||
    businessName.length < 2 ||
    (phone !== null && phone.length < 7) ||
    (city !== null && city.length < 2) ||
    record.consent !== true
  ) {
    throw new InvalidPayloadError()
  }

  return {
    id,
    name,
    email,
    businessName,
    phone,
    city,
    message,
  }
}

function requiredEnv(name: string) {
  const value = Deno.env.get(name)
  if (!value) throw new ConfigurationError()
  return value
}

function readEmailConfig(): SmtpConfig {
  const host = requiredEnv("SMTP_HOST").trim()
  const portValue = requiredEnv("SMTP_PORT").trim()
  const user = requiredEnv("SMTP_USER")
  const password = requiredEnv("SMTP_PASSWORD")
  const from = requiredEnv("SMTP_FROM").trim()
  const to = requiredEnv("PILOT_INQUIRY_TO").trim()

  if (
    !host ||
    /[\s\r\n]/u.test(host) ||
    !/^\d+$/u.test(portValue) ||
    /[\r\n]/u.test(user) ||
    /[\r\n]/u.test(password) ||
    !emailPattern.test(from) ||
    !emailPattern.test(to)
  ) {
    throw new ConfigurationError()
  }

  const port = Number(portValue)
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new ConfigurationError()
  }

  return { host, port, user, password, from, to }
}

function timingSafeEqual(leftValue: string, rightValue: string) {
  const left = new TextEncoder().encode(leftValue)
  const right = new TextEncoder().encode(rightValue)
  const length = Math.max(left.length, right.length)
  let difference = left.length ^ right.length

  for (let index = 0; index < length; index += 1) {
    const leftByte = left[index % Math.max(left.length, 1)] ?? 0
    const rightByte = right[index % Math.max(right.length, 1)] ?? 0
    difference |= leftByte ^ rightByte
  }

  return difference === 0
}

function getAdminClient(): AdminClient {
  const url = Deno.env.get("SUPABASE_URL")
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  if (!url || !serviceRoleKey) throw new ConfigurationError()

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  })
}

async function ensureNotificationRow(client: AdminClient, inquiryId: string) {
  const { error } = await client.from(notificationTable).upsert(
    {
      inquiry_id: inquiryId,
      status: "pending",
      attempts: 0,
    },
    { ignoreDuplicates: true, onConflict: "inquiry_id" },
  )

  if (error) throw new Error("notification row could not be created")
}

async function readNotificationRow(
  client: AdminClient,
  inquiryId: string,
): Promise<NotificationRow> {
  const { data, error } = await client
    .from(notificationTable)
    .select("inquiry_id, status, attempts, last_attempt_at")
    .eq("inquiry_id", inquiryId)
    .maybeSingle()

  if (error || !data) throw new Error("notification row could not be read")

  return data as NotificationRow
}

async function claimNotification(
  client: AdminClient,
  inquiryId: string,
): Promise<
  | { kind: "claimed"; attempts: number }
  | { kind: "sent" }
  | { kind: "busy" }
> {
  const row = await readNotificationRow(client, inquiryId)

  if (row.status === "sent") return { kind: "sent" }

  const lastAttempt = row.last_attempt_at
    ? Date.parse(row.last_attempt_at)
    : Number.NaN
  const isFreshSendingAttempt =
    row.status === "sending" &&
    Number.isFinite(lastAttempt) &&
    Date.now() - lastAttempt < staleAttemptMs

  if (isFreshSendingAttempt) return { kind: "busy" }

  const nextAttempts = row.attempts + 1
  const { data, error } = await client
    .from(notificationTable)
    .update({
      attempts: nextAttempts,
      last_attempt_at: new Date().toISOString(),
      last_error: null,
      status: "sending",
      updated_at: new Date().toISOString(),
    })
    .eq("inquiry_id", inquiryId)
    .eq("status", row.status)
    .eq("attempts", row.attempts)
    .select("inquiry_id")
    .maybeSingle()

  if (error) throw new Error("notification row could not be claimed")
  if (!data) return { kind: "busy" }

  return { kind: "claimed", attempts: nextAttempts }
}

async function markNotificationSent(
  client: AdminClient,
  inquiryId: string,
  attempts: number,
) {
  const { data, error } = await client
    .from(notificationTable)
    .update({
      last_error: null,
      sent_at: new Date().toISOString(),
      status: "sent",
      updated_at: new Date().toISOString(),
    })
    .eq("inquiry_id", inquiryId)
    .eq("status", "sending")
    .eq("attempts", attempts)
    .select("inquiry_id")
    .maybeSingle()

  if (error || !data) throw new Error("notification row could not be completed")
}

async function markNotificationFailed(
  client: AdminClient,
  inquiryId: string,
  attempts: number,
  reason: string,
) {
  const { error } = await client
    .from(notificationTable)
    .update({
      last_error: reason.slice(0, 500),
      status: "failed",
      updated_at: new Date().toISOString(),
    })
    .eq("inquiry_id", inquiryId)
    .eq("status", "sending")
    .eq("attempts", attempts)

  if (error) throw new Error("notification failure could not be recorded")
}

function errorReason(error: unknown) {
  if (error instanceof SmtpError) return `smtp-${error.reason}`
  if (error instanceof ConfigurationError) return "configuration"
  return "internal"
}

function withTimeout<T>(promise: Promise<T>, milliseconds: number) {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new SmtpError("timeout"))
    }, milliseconds)

    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error: unknown) => {
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

class SmtpReader {
  private buffer = new Uint8Array()
  private readonly decoder = new TextDecoder()

  constructor(private readonly connection: SmtpConnection) {}

  async readLine() {
    while (true) {
      const newlineIndex = this.buffer.indexOf(10)
      if (newlineIndex >= 0) {
        const lineBytes = this.buffer.slice(0, newlineIndex)
        this.buffer = this.buffer.slice(newlineIndex + 1)
        const line = this.decoder.decode(lineBytes)
        return line.endsWith("\r") ? line.slice(0, -1) : line
      }

      const chunk = new Uint8Array(1_024)
      const count = await withTimeout(
        this.connection.read(chunk),
        smtpTimeoutMs,
      )
      if (count === null) throw new SmtpError("connection-closed")
      if (count === 0) continue

      const nextBuffer = new Uint8Array(this.buffer.length + count)
      nextBuffer.set(this.buffer)
      nextBuffer.set(chunk.subarray(0, count), this.buffer.length)
      this.buffer = nextBuffer

      if (this.buffer.length > 16 * 1_024) {
        throw new SmtpError("response-too-large")
      }
    }
  }
}

async function writeAll(connection: SmtpConnection, value: string) {
  const bytes = new TextEncoder().encode(value)
  let offset = 0

  while (offset < bytes.length) {
    const count = await withTimeout(
      connection.write(bytes.subarray(offset)),
      smtpTimeoutMs,
    )
    if (count <= 0) throw new SmtpError("write-failed")
    offset += count
  }
}

async function readResponse(reader: SmtpReader): Promise<SmtpResponse> {
  const firstLine = await reader.readLine()
  const firstMatch = /^(\d{3})([ -])/.exec(firstLine)
  if (!firstMatch) throw new SmtpError("invalid-response")

  const code = Number(firstMatch[1])
  const lines = [firstLine]

  if (firstMatch[2] === "-") {
    while (true) {
      const line = await reader.readLine()
      lines.push(line)
      if (line.startsWith(`${code} `)) break
      if (!line.startsWith(`${code}-`)) {
        throw new SmtpError("invalid-multiline-response", code)
      }
    }
  }

  return { code, lines }
}

async function sendCommand(
  connection: SmtpConnection,
  reader: SmtpReader,
  command: string,
) {
  await writeAll(connection, `${command}\r\n`)
  return readResponse(reader)
}

function expectCode(response: SmtpResponse, ...acceptedCodes: number[]) {
  if (!acceptedCodes.includes(response.code)) {
    throw new SmtpError(`response-${response.code}`, response.code)
  }
}

function hasStartTlsCapability(response: SmtpResponse) {
  return response.lines.some((line) => /\bSTARTTLS\b/iu.test(line))
}

function encodeBase64(value: Uint8Array) {
  let binary = ""
  for (const byte of value) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function encodeBase64Text(value: string) {
  return encodeBase64(new TextEncoder().encode(value))
}

function wrapBase64(value: string, width: number) {
  const lines: string[] = []
  for (let offset = 0; offset < value.length; offset += width) {
    lines.push(value.slice(offset, offset + width))
  }
  return lines.join("\r\n")
}

function normalizeBodyValue(value: string) {
  return value
    .replace(/\r\n?/gu, "\n")
    .replace(/\u0000/gu, "")
    .split("\n")
    .map((line, index) => (index === 0 ? line : `  ${line}`))
    .join("\n")
}

function buildEmailMessage(config: SmtpConfig, inquiry: InquiryRecord) {
  const body = [
    "A new KOT Platform pilot inquiry was submitted.",
    "",
    `Name: ${normalizeBodyValue(inquiry.name)}`,
    `Email: ${normalizeBodyValue(inquiry.email)}`,
    `Business: ${normalizeBodyValue(inquiry.businessName)}`,
    `Phone: ${inquiry.phone ? normalizeBodyValue(inquiry.phone) : "Not provided"}`,
    `City: ${inquiry.city ? normalizeBodyValue(inquiry.city) : "Not provided"}`,
    "",
    "Message:",
    inquiry.message ? normalizeBodyValue(inquiry.message) : "Not provided",
  ].join("\n")

  const encodedBody = wrapBase64(encodeBase64Text(body), 76)

  return [
    `Date: ${new Date().toUTCString()}`,
    `From: ${config.from}`,
    `To: ${config.to}`,
    `Reply-To: ${inquiry.email}`,
    "Subject: [KOT Platform] New pilot inquiry",
    `Message-ID: <pilot-inquiry-${inquiry.id}@kot-platform.local>`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    encodedBody,
  ].join("\r\n")
}

function smtpData(value: string) {
  const lines = value.replace(/\r\n?/gu, "\n").split("\n")
  const escapedLines = lines.map((line) => (line.startsWith(".") ? `.${line}` : line))
  return `${escapedLines.join("\r\n")}\r\n.\r\n`
}

async function sendInquiryEmail(config: SmtpConfig, inquiry: InquiryRecord) {
  let connection: SmtpConnection | null = null

  try {
    let activeConnection: Deno.TcpConn | Deno.TlsConn
    if (config.port === 465) {
      activeConnection = await withTimeout(
        Deno.connectTls({ hostname: config.host, port: config.port }),
        smtpTimeoutMs,
      )
    } else {
      activeConnection = await withTimeout(
        Deno.connect({ hostname: config.host, port: config.port }),
        smtpTimeoutMs,
      )
    }
    connection = activeConnection

    let reader = new SmtpReader(activeConnection)
    expectCode(await readResponse(reader), 220)

    let ehloResponse = await sendCommand(
      activeConnection,
      reader,
      "EHLO supabase-edge-function",
    )

    if (ehloResponse.code !== 250) {
      expectCode(
        await sendCommand(activeConnection, reader, "HELO supabase-edge-function"),
        250,
      )
    }

    if (config.port !== 465) {
      if (ehloResponse.code !== 250 || !hasStartTlsCapability(ehloResponse)) {
        throw new SmtpError("starttls-not-advertised")
      }

      expectCode(await sendCommand(activeConnection, reader, "STARTTLS"), 220)
      activeConnection = await withTimeout(
        Deno.startTls(activeConnection as Deno.TcpConn, { hostname: config.host }),
        smtpTimeoutMs,
      )
      connection = activeConnection
      reader = new SmtpReader(activeConnection)
      ehloResponse = await sendCommand(
        activeConnection,
        reader,
        "EHLO supabase-edge-function",
      )
      expectCode(ehloResponse, 250)
    }

    let authResponse = await sendCommand(
      activeConnection,
      reader,
      `AUTH PLAIN ${encodeBase64Text(`\u0000${config.user}\u0000${config.password}`)}`,
    )

    if (authResponse.code === 334) {
      authResponse = await sendCommand(
        activeConnection,
        reader,
        encodeBase64Text(`\u0000${config.user}\u0000${config.password}`),
      )
    }

    if (authResponse.code !== 235) {
      expectCode(await sendCommand(activeConnection, reader, "AUTH LOGIN"), 334)
      expectCode(
        await sendCommand(activeConnection, reader, encodeBase64Text(config.user)),
        334,
      )
      expectCode(
        await sendCommand(
          activeConnection,
          reader,
          encodeBase64Text(config.password),
        ),
        235,
      )
    }

    expectCode(
      await sendCommand(activeConnection, reader, `MAIL FROM:<${config.from}>`),
      250,
    )
    expectCode(
      await sendCommand(activeConnection, reader, `RCPT TO:<${config.to}>`),
      250,
      251,
    )
    expectCode(await sendCommand(activeConnection, reader, "DATA"), 354)
    await writeAll(
      activeConnection,
      smtpData(buildEmailMessage(config, inquiry)),
    )
    expectCode(await readResponse(reader), 250)

    try {
      await sendCommand(activeConnection, reader, "QUIT")
    } catch {
      // The message was accepted already; a broken QUIT response must not
      // turn a successful delivery into a retry that could duplicate it.
    }
  } finally {
    try {
      connection?.close()
    } catch {
      // The connection is already ending; there is nothing useful to recover.
    }
  }
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { allow: "POST" },
    })
  }

  const expectedWebhookSecret = Deno.env.get("PILOT_INQUIRY_WEBHOOK_SECRET")
  const suppliedWebhookSecret = request.headers.get(webhookSecretHeader)
  if (!expectedWebhookSecret) {
    console.error("Pilot inquiry notification is not configured", "webhook-secret")
    return jsonResponse(500, { status: "error" })
  }
  if (
    !suppliedWebhookSecret ||
    !timingSafeEqual(suppliedWebhookSecret, expectedWebhookSecret)
  ) {
    return jsonResponse(401, { status: "unauthorized" })
  }

  const requestBody = await request.text()
  if (new TextEncoder().encode(requestBody).byteLength > maximumPayloadBytes) {
    return jsonResponse(413, { status: "payload-too-large" })
  }

  let inquiry: InquiryRecord
  try {
    inquiry = parseWebhookPayload(JSON.parse(requestBody))
  } catch (error) {
    if (!(error instanceof InvalidPayloadError)) {
      console.error("Pilot inquiry notification received invalid JSON")
    }
    return jsonResponse(400, { status: "invalid-payload" })
  }

  let config: SmtpConfig
  let client: AdminClient
  try {
    config = readEmailConfig()
    client = getAdminClient()
  } catch {
    console.error("Pilot inquiry notification is not configured", "email-or-database")
    return jsonResponse(500, { status: "error" })
  }

  let claim: Awaited<ReturnType<typeof claimNotification>>
  try {
    await ensureNotificationRow(client, inquiry.id)
    claim = await claimNotification(client, inquiry.id)
  } catch {
    console.error("Pilot inquiry notification state operation failed")
    return jsonResponse(500, { status: "error" })
  }

  if (claim.kind === "sent") {
    return jsonResponse(200, { status: "already-sent" })
  }
  if (claim.kind === "busy") {
    return jsonResponse(202, { status: "in-progress" })
  }

  try {
    await sendInquiryEmail(config, inquiry)
    await markNotificationSent(client, inquiry.id, claim.attempts)
    return jsonResponse(200, { status: "sent" })
  } catch (error) {
    const reason = errorReason(error)
    try {
      await markNotificationFailed(client, inquiry.id, claim.attempts, reason)
    } catch {
      console.error("Pilot inquiry notification failure state operation failed")
    }
    console.error("Pilot inquiry notification delivery failed", reason)
    return jsonResponse(500, { status: "delivery-failed" })
  }
})
