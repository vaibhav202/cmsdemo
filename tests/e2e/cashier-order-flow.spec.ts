import assert from "node:assert/strict"
import { test } from "node:test"

import { login, withFirefoxPage } from "./firefox-bidi"

test("cashier can book one multi-item counter ticket and undo it", async () => {
  await withFirefoxPage(async (page) => {
    await login(page, "cashier@citycanteen.in", "Cashier@2026")

    const initial = await page.evaluateJson<{
      cartLines: number
      orderForms: number
      path: string
      viewportFits: boolean
    }>(`({
      cartLines: document.querySelectorAll("[data-cart-line]").length,
      orderForms: document.querySelectorAll('form[id^="order-form-"]').length,
      path: location.pathname,
      viewportFits:
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth
    })`)

    assert.equal(initial.path, "/app/city-canteen/order")
    assert.ok(initial.orderForms >= 2, "the fixture should contain two menu forms")
    assert.equal(initial.cartLines, 0)
    assert.equal(initial.viewportFits, true)

    await page.evaluate(`(() => {
      const form = document.querySelector('form[id^="order-form-"]')
      const button = form?.querySelector('button[type="submit"]')
      if (!(button instanceof HTMLButtonElement) || button.disabled) {
        throw new Error("No enabled first menu button")
      }
      button.click()
      return true
    })()`)

    await page.waitFor(
      `document.querySelectorAll("[data-cart-line]").length === 1`
    )

    await page.evaluate(`(() => {
      const forms = Array.from(document.querySelectorAll('form[id^="order-form-"]'))
      const form = forms[1]
      const button = form?.querySelector('button[type="submit"]')
      if (!(button instanceof HTMLButtonElement) || button.disabled) {
        throw new Error("No enabled second menu button")
      }
      button.click()
      return true
    })()`)

    await page.waitFor(
      `document.querySelectorAll("[data-cart-line]").length === 2`
    )

    const cart = await page.evaluateJson<{
      checkoutForms: number
      lineNames: string[]
      totalQuantity: string
    }>(`({
      checkoutForms: document.querySelectorAll("form[data-order-checkout]").length,
      lineNames: Array.from(document.querySelectorAll("[data-cart-line]")).map(
        (line) => line.textContent?.trim() ?? ""
      ),
      totalQuantity:
        document.querySelector("[data-cart-total]")?.textContent?.trim() ?? ""
    })`)

    assert.equal(cart.checkoutForms, 1)
    assert.equal(cart.lineNames.length, 2)
    assert.ok(cart.lineNames.some((name) => name.includes("Test meal")))
    assert.ok(cart.lineNames.some((name) => name.includes("Test snack")))
    assert.equal(cart.totalQuantity, "2")

    await page.evaluate(`(() => {
      const form = document.querySelector("form[data-order-checkout]")
      const button = form?.querySelector('button[type="submit"]')
      if (!(button instanceof HTMLButtonElement)) {
        throw new Error("The cart checkout button was not rendered")
      }
      button.click()
      return true
    })()`)

    await page.waitFor(
      `document.querySelectorAll("[data-cart-line]").length === 0 &&
       document.body.textContent?.includes("Ticket #102 booked") === true &&
       Array.from(document.querySelectorAll("button")).some(
         (button) => button.textContent?.trim() === "Undo"
       )`
    )

    const bookingFeedback = await page.evaluateJson<{
      bookedTicket: boolean
      undoButtons: number
    }>(`({
      bookedTicket: document.body.textContent?.includes("Ticket #102 booked") === true,
      undoButtons: Array.from(document.querySelectorAll("button")).filter(
        (button) => button.textContent?.trim() === "Undo"
      ).length
    })`)

    assert.equal(bookingFeedback.bookedTicket, true)
    assert.equal(bookingFeedback.undoButtons, 1)

    await page.evaluate(`(() => {
      const undo = Array.from(document.querySelectorAll("button")).find(
        (button) => button.textContent?.trim() === "Undo"
      )
      if (!(undo instanceof HTMLButtonElement)) {
        throw new Error("Undo action was not rendered")
      }
      undo.click()
      return true
    })()`)

    await page.waitFor(
      `document.body.textContent?.includes("Order cancelled") === true`
    )

    assert.deepEqual(page.browserErrors, [])
  })
})
