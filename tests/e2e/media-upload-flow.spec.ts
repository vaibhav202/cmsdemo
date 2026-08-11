import assert from "node:assert/strict"
import { test } from "node:test"
import { fileURLToPath } from "node:url"

import { login, withFirefoxPage } from "./firefox-bidi"

test("vendor owner can preview and persist a demo vendor logo upload in Firefox", async () => {
  await withFirefoxPage(async (page) => {
    await login(page, "owner@citycanteen.in", "Owner@2026")
    await page.navigate("/app/city-canteen/control")
    await page.waitFor(
      `Boolean(document.querySelector('form[data-media-mode="demo"][data-media-ready="true"] input[type="file"]'))`,
      15_000
    )
    await page.evaluate(`localStorage.clear()`)
    await page.setFiles(
      'form[data-media-mode="demo"] input[type="file"]',
      [fileURLToPath(new URL("../fixtures/media/city-canteen-logo.png", import.meta.url))]
    )
    await page.evaluate(`(() => {
      const input = document.querySelector(
        'form[data-media-mode="demo"] input[type="file"]'
      )
      if (!(input instanceof HTMLInputElement)) {
        throw new Error("Demo media input was not rendered")
      }
      input.dispatchEvent(new Event("change", { bubbles: true }))
      return true
    })()`)

    await page.waitFor(
      `(() => {
        const button = document.querySelector(
          'form[data-media-mode="demo"] button[type="submit"]'
        )
        return button instanceof HTMLButtonElement && !button.disabled
      })()`
    )
    await page.evaluate(`(() => {
      const button = document.querySelector(
        'form[data-media-mode="demo"] button[type="submit"]'
      )
      if (!(button instanceof HTMLButtonElement)) {
        throw new Error("Demo media upload button was not rendered")
      }
      button.click()
      return true
    })()`)

    await page.waitFor(
      `document.querySelector('form[data-media-mode="demo"] [aria-live="polite"]')?.textContent?.includes("Demo image saved")`
    )

    await page.navigate("/app/city-canteen/control")
    await page.waitFor(
      `Boolean(document.querySelector('form[data-media-mode="demo"][data-media-ready="true"] img[src^="data:image/png"]'))`,
      15_000
    )

    const result = await page.evaluateJson<{
      hasDataUrl: boolean
      hasLocalStorageValue: boolean
      persistedAfterReload: boolean
      path: string
    }>(`(() => {
      const form = document.querySelector('form[data-media-mode="demo"]')
      const image = form?.querySelector('img')
      const key = Object.keys(localStorage).find((value) =>
        value.startsWith("cms-platform:demo-media:")
      )
      return {
        hasDataUrl: image?.getAttribute("src")?.startsWith("data:image/png") ?? false,
        hasLocalStorageValue: Boolean(key && localStorage.getItem(key)),
        persistedAfterReload: Boolean(
          image?.getAttribute("src")?.startsWith("data:image/png")
        ),
        path: location.pathname,
      }
    })()`)

    assert.equal(result.path, "/app/city-canteen/control")
    assert.equal(result.hasDataUrl, true)
    assert.equal(result.hasLocalStorageValue, true)
    assert.equal(result.persistedAfterReload, true)
    assert.deepEqual(page.browserErrors, [])
  })
})

test("vendor owner can upload and persist an avatar from the mobile account sheet", async () => {
  await withFirefoxPage(async (page) => {
    await login(page, "owner@citycanteen.in", "Owner@2026")
    await page.waitFor(
      `document.querySelector('button[aria-label="Open account"]')`,
      15_000
    )
    await page.evaluate(`localStorage.clear()`)

    await page.evaluate(`document.querySelector('button[aria-label="Open account"]')?.click()`)
    await page.waitFor(
      `document.querySelector('[data-slot="sheet-content"]')?.textContent?.includes("Account")`
    )
    await page.waitFor(
      `Boolean(document.querySelector('[data-slot="sheet-content"] form[data-media-mode="demo"][data-media-ready="true"] input[type="file"]'))`
    )

    await page.setFiles(
      '[data-slot="sheet-content"] form[data-media-mode="demo"] input[type="file"]',
      [fileURLToPath(new URL("../fixtures/media/city-canteen-logo.png", import.meta.url))]
    )
    await page.evaluate(`(() => {
      const input = document.querySelector(
        '[data-slot="sheet-content"] form[data-media-mode="demo"] input[type="file"]'
      )
      if (!(input instanceof HTMLInputElement)) {
        throw new Error("Mobile account media input was not rendered")
      }
      input.dispatchEvent(new Event("change", { bubbles: true }))
      return true
    })()`)

    await page.waitFor(
      `(() => {
        const button = document.querySelector(
          '[data-slot="sheet-content"] form[data-media-mode="demo"] button[type="submit"]'
        )
        return button instanceof HTMLButtonElement && !button.disabled
      })()`
    )
    await page.evaluate(`(() => {
      const button = document.querySelector(
        '[data-slot="sheet-content"] form[data-media-mode="demo"] button[type="submit"]'
      )
      if (!(button instanceof HTMLButtonElement)) {
        throw new Error("Mobile account upload button was not rendered")
      }
      button.click()
      return true
    })()`)

    await page.waitFor(
      `document.querySelector('[data-slot="sheet-content"] form[data-media-mode="demo"] [aria-live="polite"]')?.textContent?.includes("Demo image saved")`
    )

    const saved = await page.evaluateJson<{
      hasDataUrl: boolean
      hasLocalStorageValue: boolean
    }>(`(() => {
      const form = document.querySelector('[data-slot="sheet-content"] form[data-media-mode="demo"]')
      const image = form?.querySelector('img')
      const key = Object.keys(localStorage).find((value) =>
        value === "cms-platform:demo-media:city-canteen:member-avatar:owner@citycanteen.in"
      )
      return {
        hasDataUrl: image?.getAttribute("src")?.startsWith("data:image/png") ?? false,
        hasLocalStorageValue: Boolean(key && localStorage.getItem(key)),
      }
    })()`)

    assert.equal(saved.hasDataUrl, true)
    assert.equal(saved.hasLocalStorageValue, true)

    await page.navigate("/app/city-canteen/order")
    await page.waitFor(
      `document.querySelector('button[aria-label="Open account"]')`,
      15_000
    )
    await page.evaluate(`document.querySelector('button[aria-label="Open account"]')?.click()`)
    await page.waitFor(
      `document.querySelector('[data-slot="sheet-content"]')?.textContent?.includes("Account")`
    )
    await page.waitFor(
      `Boolean(document.querySelector('[data-slot="sheet-content"] form[data-media-mode="demo"] img[src^="data:image/png"]'))`
    )

    assert.deepEqual(page.browserErrors, [])
  })
})
