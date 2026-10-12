import assert from "node:assert/strict"

import {
  findWorkspaceAccount,
  getPostLoginRoute,
  WORKSPACE_SESSION_COOKIE,
} from "../../src/features/auth/demo-session"
import { withChromiumPage } from "./chromium-cdp"

type PendingRequest = {
  reject: (error: Error) => void
  resolve: (value: BidiMessage) => void
}

type BidiMessage = {
  error?: string
  id?: number
  method?: string
  params?: {
    level?: string
    text?: string
  }
  result?: Record<string, unknown>
}

export type BrowserPage = {
  browserErrors: string[]
  context?: string
  evaluate(expression: string): Promise<any>
  evaluateJson<T>(expression: string): Promise<T>
  navigate(path: string): Promise<void>
  setCookie(name: string, value: string): Promise<void>
  setViewport(width: number, height: number): Promise<void>
  setFiles(selector: string, files: string[]): Promise<void>
  waitFor(expression: string, timeoutMs?: number): Promise<void>
}

export type FirefoxPage = BrowserPage

const baseUrl = process.env.E2E_BASE_URL ?? "http://127.0.0.1:3100"
const bidiUrl = process.env.FIREFOX_BIDI_URL ?? "ws://127.0.0.1:9222/session"

function delay(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function remoteValue(message: BidiMessage) {
  const result = message.result?.result as { value?: unknown } | undefined
  return result?.value
}

export async function withFirefoxPage(
  run: (page: BrowserPage) => Promise<void>
) {
  const browserType = process.env.E2E_BROWSER?.toLowerCase()
  if (browserType === "brave" || browserType === "chromium") {
    return withChromiumPage(run)
  }

  const socket = new WebSocket(bidiUrl)
  const pending = new Map<number, PendingRequest>()
  const browserErrors: string[] = []
  let nextId = 1
  let context: string | undefined

  const opened = new Promise<void>((resolve, reject) => {
    socket.addEventListener("open", () => resolve())
    socket.addEventListener("error", () =>
      reject(new Error(`Unable to connect to Firefox BiDi at ${bidiUrl}`))
    )
  })

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(String(event.data)) as BidiMessage

    if (
      message.method === "log.entryAdded" &&
      message.params?.level === "error" &&
      message.params.text
    ) {
      browserErrors.push(message.params.text)
    }

    if (message.id && pending.has(message.id)) {
      const request = pending.get(message.id)
      pending.delete(message.id)

      if (!request) return
      if (message.error) {
        request.reject(new Error(JSON.stringify(message)))
      } else {
        request.resolve(message)
      }
    }
  })

  function send(method: string, params: Record<string, unknown> = {}) {
    const id = nextId++
    socket.send(JSON.stringify({ id, method, params }))

    return new Promise<BidiMessage>((resolve, reject) => {
      pending.set(id, { reject, resolve })
    })
  }

  try {
    await opened
    await send("session.new", {
      capabilities: { alwaysMatch: { acceptInsecureCerts: true } },
    })
    await send("session.subscribe", { events: ["log.entryAdded"] })

    const created = await send("browsingContext.create", { type: "tab" })
    context = created.result?.context as string
    assert.ok(context, "Firefox should create a browsing context")

    await send("browsingContext.setViewport", {
      context,
      devicePixelRatio: 1,
      viewport: { height: 932, width: 430 },
    })

    async function evaluate(expression: string) {
      return send("script.evaluate", {
        awaitPromise: true,
        expression,
        target: { context },
      })
    }

    const page: BrowserPage = {
      browserErrors,
      context,
      evaluate,
      async evaluateJson<T>(expression: string) {
        const message = await evaluate(`JSON.stringify(${expression})` as string)
        const value = remoteValue(message as BidiMessage)
        if (typeof value !== "string") {
          throw new Error("Firefox script did not return serialized JSON")
        }
        return JSON.parse(value) as T
      },
      async navigate(path: string) {
        await send("browsingContext.navigate", {
          context,
          url: new URL(path, baseUrl).toString(),
          wait: "complete",
        })
      },
      async setCookie(name: string, value: string) {
        await send("storage.setCookie", {
          cookie: {
            domain: "127.0.0.1",
            httpOnly: true,
            name,
            path: "/",
            sameSite: "lax",
            secure: false,
            value: {
              type: "string",
              value,
            },
          },
        })
      },
      async setViewport(width: number, height: number) {
        await send("browsingContext.setViewport", {
          context,
          devicePixelRatio: 1,
          viewport: { height, width },
        })
      },
      async setFiles(selector: string, files: string[]) {
        const located = await send("browsingContext.locateNodes", {
          context,
          locator: { type: "css", value: selector },
        })
        const nodes = located.result?.nodes as
          | Array<{ sharedId?: string }>
          | undefined
        const sharedId = nodes?.[0]?.sharedId

        assert.ok(sharedId, `Firefox could not locate file input: ${selector}`)
        await send("input.setFiles", {
          context,
          element: { sharedId },
          files,
        })
      },
      async waitFor(expression: string, timeoutMs = 5_000) {
        const deadline = Date.now() + timeoutMs

        while (Date.now() < deadline) {
          if (remoteValue(await evaluate(`Boolean(${expression})`))) return
          await delay(50)
        }

        throw new Error(`Timed out waiting for browser condition: ${expression}`)
      },
    }

    await run(page)
  } finally {
    if (context) {
      await send("browsingContext.close", { context }).catch(() => {})
    }
    await send("session.end").catch(() => {})
    socket.close()
  }
}

export const withBrowserPage = withFirefoxPage

export async function login(
  page: BrowserPage,
  email: string,
  password: string
) {
  const account = findWorkspaceAccount(email, password)

  assert.ok(
    account,
    `Cannot seed a demo session for nonexistent account: ${email}`
  )

  await page.setCookie(WORKSPACE_SESSION_COOKIE, account.id)
  await page.navigate(getPostLoginRoute(account))
}
