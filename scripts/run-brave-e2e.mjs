import { spawn } from "node:child_process"
import { mkdtemp, rm } from "node:fs/promises"
import net from "node:net"
import os from "node:os"
import path from "node:path"

const host = "127.0.0.1"
const appPort = Number(process.env.E2E_PORT ?? 3100)
const cdpPort = Number(process.env.BRAVE_CDP_PORT ?? 9222)
const baseUrl = `http://${host}:${appPort}`
const cdpUrl = `http://${host}:${cdpPort}`
const braveBinary =
  process.env.BRAVE_BIN ??
  process.env.CHROMIUM_BIN ??
  "/opt/brave.com/brave-origin/brave"

const profile = await mkdtemp(path.join(os.tmpdir(), "kotdemo-brave-e2e-"))
const childProcesses = []

function start(command, args, options = {}) {
  const child = spawn(command, args, {
    env: process.env,
    stdio: "inherit",
    ...options,
  })
  childProcesses.push(child)
  return child
}

function waitForPort(port, timeoutMs) {
  const deadline = Date.now() + timeoutMs

  return new Promise((resolve, reject) => {
    function probe() {
      const socket = net.createConnection({ host, port })

      socket.once("connect", () => {
        socket.destroy()
        resolve()
      })
      socket.once("error", () => {
        socket.destroy()

        if (Date.now() >= deadline) {
          reject(new Error(`Timed out waiting for ${host}:${port}`))
        } else {
          setTimeout(probe, 100)
        }
      })
    }

    probe()
  })
}

async function stop(child) {
  if (child.exitCode !== null || child.signalCode !== null) return

  child.kill("SIGTERM")

  await Promise.race([
    new Promise((resolve) => child.once("exit", resolve)),
    new Promise((resolve) => setTimeout(resolve, 3_000)),
  ])

  if (child.exitCode === null && child.signalCode === null) {
    child.kill("SIGKILL")
  }
}

let resultCode = 1

try {
  start(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "dev",
      "--hostname",
      host,
      "--port",
      String(appPort),
    ],
    {
      env: {
        ...process.env,
        E2E_USE_FIXTURES: "1",
        NEXT_DIST_DIR: ".next-e2e",
        NEXT_TELEMETRY_DISABLED: "1",
      },
    }
  )

  await waitForPort(appPort, 60_000)

  start(braveBinary, [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    `--user-data-dir=${profile}`,
    `--remote-debugging-port=${cdpPort}`,
    "about:blank",
  ])

  await waitForPort(cdpPort, 30_000)

  const tests = start(
    process.execPath,
    [
      "--import",
      "tsx",
      "--test",
      "--test-concurrency=1",
      "tests/e2e/cashier-order-flow.spec.ts",
      "tests/e2e/header-mobile-interactions.spec.ts",
      "tests/e2e/kitchen-queue-flow.spec.ts",
      "tests/e2e/media-upload-flow.spec.ts",
      "tests/e2e/public-acquisition.spec.ts",
    ],
    {
      env: {
        ...process.env,
        E2E_BASE_URL: baseUrl,
        E2E_BROWSER: "brave",
        BRAVE_CDP_URL: cdpUrl,
      },
    }
  )

  resultCode = await new Promise((resolve) => {
    tests.once("exit", (code) => resolve(code ?? 1))
  })
} finally {
  for (const child of childProcesses.reverse()) {
    await stop(child)
  }

  await rm(profile, { force: true, recursive: true })
}

process.exitCode = resultCode
