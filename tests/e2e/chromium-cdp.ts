import assert from "node:assert/strict"

import {
  findWorkspaceAccount,
  getPostLoginRoute,
  WORKSPACE_SESSION_COOKIE,
} from "../../src/features/auth/demo-session"

type PendingRequest = {
  reject: (error: Error) => void
  resolve: (value: any) => void
}

type CdpMessage = {
  error?: { message?: string }
  id?: number
  method?: string
  params?: any
  result?: any
}

export type BrowserPage = {
  browserErrors: string[]
  evaluate(expression: string): Promise<any>
  evaluateJson<T>(expression: string): Promise<T>
  navigate(path: string): Promise<void>
  setCookie(name: string, value: string): Promise<void>
  setFiles(selector: string, files: string[]): Promise<void>
  setViewport(width: number, height: number): Promise<void>
  waitFor(expression: string, timeoutMs?: number): Promise<void>
}

const baseUrl = process.env.E2E_BASE_URL ?? "http://127.0.0.1:3100"
const cdpHttpUrl = process.env.BRAVE_CDP_URL ?? process.env.CHROMIUM_CDP_URL ?? "http://127.0.0.1:9222"

function delay(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

export async function withChromiumPage(
  run: (page: BrowserPage) => Promise<void>
) {
  const targetRes = await fetch(`${cdpHttpUrl}/json/new`, { method: "PUT" })
  const target = (await targetRes.json()) as { id: string; webSocketDebuggerUrl: string }
  const targetId = target.id
  const wsUrl = target.webSocketDebuggerUrl

  const socket = new WebSocket(wsUrl)
  const pending = new Map<number, PendingRequest>()
  const browserErrors: string[] = []
  let nextId = 1

  const opened = new Promise<void>((resolve, reject) => {
    socket.addEventListener("open", () => resolve())
    socket.addEventListener("error", () =>
      reject(new Error(`Unable to connect to Chromium CDP at ${wsUrl}`))
    )
  })

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(String(event.data)) as CdpMessage

    if (message.method === "Runtime.exceptionThrown" && message.params?.exceptionDetails) {
      const details = message.params.exceptionDetails
      const text = details.exception?.description || details.text || "Unknown exception"
      browserErrors.push(text)
    }

    if (
      message.method === "Log.entryAdded" &&
      message.params?.entry?.level === "error" &&
      message.params.entry.text
    ) {
      browserErrors.push(message.params.entry.text)
    }

    if (message.id && pending.has(message.id)) {
      const request = pending.get(message.id)
      pending.delete(message.id)

      if (!request) return
      if (message.error) {
        request.reject(new Error(message.error.message || JSON.stringify(message.error)))
      } else {
        request.resolve(message.result)
      }
    }
  })

  function send(method: string, params: Record<string, unknown> = {}) {
    const id = nextId++
    socket.send(JSON.stringify({ id, method, params }))

    return new Promise<any>((resolve, reject) => {
      pending.set(id, { reject, resolve })
    })
  }

  try {
    await opened
    await send("Page.enable")
    await send("Runtime.enable")
    await send("Network.enable")
    await send("DOM.enable")
    await send("Log.enable")

    await send("Emulation.setDeviceMetricsOverride", {
      width: 430,
      height: 932,
      deviceScaleFactor: 1,
      mobile: true,
    })

    async function evaluate(expression: string) {
      const res = await send("Runtime.evaluate", {
        expression,
        awaitPromise: true,
        returnByValue: false,
      })
      return res
    }

    const page: BrowserPage = {
      browserErrors,
      evaluate,
      async evaluateJson<T>(expression: string) {
        const res = await send("Runtime.evaluate", {
          expression: `JSON.stringify(${expression})`,
          awaitPromise: true,
          returnByValue: true,
        })
        const value = res?.result?.value
        if (typeof value !== "string") {
          throw new Error("Chromium script did not return serialized JSON")
        }
        return JSON.parse(value) as T
      },
      async navigate(path: string) {
        const url = new URL(path, baseUrl).toString()
        await send("Page.navigate", { url })
        const deadline = Date.now() + 15_000
        while (Date.now() < deadline) {
          const res = await send("Runtime.evaluate", {
            expression: "document.readyState === 'complete'",
            returnByValue: true,
          })
          if (res?.result?.value === true) break
          await delay(50)
        }
        await delay(100)
      },
      async setCookie(name: string, value: string) {
        await send("Network.setCookie", {
          name,
          value,
          url: baseUrl,
        })
      },
      async setViewport(width: number, height: number) {
        await send("Emulation.setDeviceMetricsOverride", {
          deviceScaleFactor: 1,
          height,
          mobile: width < 768,
          width,
        })
      },
      async setFiles(selector: string, files: string[]) {
        const doc = await send("DOM.getDocument", { depth: -1 })
        const node = await send("DOM.querySelector", {
          nodeId: doc.root.nodeId,
          selector,
        })
        assert.ok(
          node?.nodeId,
          `Chromium could not locate file input: ${selector}`
        )
        await send("DOM.setFileInputFiles", {
          nodeId: node.nodeId,
          files,
        })
      },
      async waitFor(expression: string, timeoutMs = 15_000) {
        const deadline = Date.now() + timeoutMs

        while (Date.now() < deadline) {
          const res = await send("Runtime.evaluate", {
            expression: `Boolean(${expression})`,
            awaitPromise: true,
            returnByValue: true,
          })
          if (res?.result?.value === true) return
          await delay(50)
        }

        throw new Error(`Timed out waiting for browser condition: ${expression}`)
      },
    }

    await run(page)
  } finally {
    socket.close()
    await fetch(`${cdpHttpUrl}/json/close/${targetId}`, { method: "PUT" }).catch(() => {})
  }
}

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
