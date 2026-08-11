import assert from "node:assert/strict"
import { test } from "node:test"

import { login, withFirefoxPage } from "./firefox-bidi"

test("cashier can schedule and undo a counter order in Firefox", async () => {
  await withFirefoxPage(async (page) => {
    await login(page, "cashier@citycanteen.in", "Cashier@2026")

    const initial = await page.evaluateJson<{
      orderForms: number
      path: string
      viewportFits: boolean
    }>(`({
      orderForms: document.querySelectorAll('form[id^="order-form-"]').length,
      path: location.pathname,
      viewportFits:
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth
    })`)

    assert.equal(initial.path, "/app/city-canteen/order")
    assert.ok(initial.orderForms > 0, "the counter menu should contain order forms")
    assert.equal(initial.viewportFits, true)

    await page.evaluate(`(() => {
      const button = Array.from(
        document.querySelectorAll('form[id^="order-form-"] button[type="submit"]')
      ).find((candidate) => !candidate.disabled)
      if (!button) throw new Error("No enabled order button")
      button.click()
      return true
    })()`)

    await page.waitFor(
      `Array.from(document.querySelectorAll("button")).some(
        (button) => button.textContent?.trim() === "Undo"
      )`
    )

    await page.evaluate(`(() => {
      const undo = Array.from(document.querySelectorAll("button")).find(
        (button) => button.textContent?.trim() === "Undo"
      )
      if (!undo) throw new Error("Undo action was not rendered")
      undo.click()
      return true
    })()`)

    await page.waitFor(
      `Array.from(
        document.querySelectorAll('form[id^="order-form-"] button[type="submit"]')
      ).some((button) => !button.disabled)`
    )

    assert.deepEqual(page.browserErrors, [])
  })
})

