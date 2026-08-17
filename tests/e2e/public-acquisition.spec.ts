import assert from "node:assert/strict"
import { test } from "node:test"

import { withFirefoxPage } from "./firefox-bidi"

test("public homepage and demo stay anonymous and interactive", async () => {
  await withFirefoxPage(async (page) => {
    await page.setCookie("cms_platform_locale", "en-IN")
    await page.navigate("/")

    const home = await page.evaluateJson<{
      hasDemoLink: boolean
      hasLoginLink: boolean
      path: string
    }>(`({
      hasDemoLink: Array.from(document.querySelectorAll("a")).some(
        (link) => link.getAttribute("href") === "/demo"
      ),
      hasLoginLink: Array.from(document.querySelectorAll("a")).some(
        (link) => link.getAttribute("href") === "/login"
      ),
      path: location.pathname
    })`)

    assert.equal(home.path, "/")
    assert.equal(home.hasDemoLink, true)
    assert.equal(home.hasLoginLink, true)

    await page.navigate("/demo")
    await page.waitFor(
      `document.querySelector('[data-demo-hydrated="true"]') !== null`
    )

    await page.evaluate(`(() => {
      const role = Array.from(document.querySelectorAll("button")).find(
        (button) => button.textContent?.trim() === "Cashier"
      )
      if (!(role instanceof HTMLButtonElement)) throw new Error("Cashier demo view missing")
      role.click()
      return true
    })()`)

    await page.waitFor(`Array.from(
      document.querySelectorAll('[data-demo-role] button')
    ).find((button) => button.getAttribute("data-state") === "on")?.textContent?.trim() === "Cashier"`)
    const selectedRole = await page.evaluateJson<string>(`Array.from(
      document.querySelectorAll('[data-demo-role] button')
    ).find((button) => button.getAttribute("data-state") === "on")?.textContent?.trim() ?? ""`)
    assert.equal(selectedRole, "Cashier")
    await page.waitFor(`document.querySelector("#demo-customer") !== null`)

    await page.evaluate(`(() => {
      const buttons = Array.from(document.querySelectorAll("button")).filter(
        (button) => button.textContent?.trim() === "Add"
      )
      if (buttons.length < 2) throw new Error("Demo menu items missing")
      buttons[0]?.click()
      return true
    })()`)
    await page.waitFor(`document.querySelector("[data-demo-cart-total]")?.textContent?.trim() === "1"`)

    await page.evaluate(`(() => {
      const buttons = Array.from(document.querySelectorAll("button")).filter(
        (button) => button.textContent?.trim() === "Add"
      )
      buttons[1]?.click()
      return true
    })()`)
    await page.waitFor(`document.querySelector("[data-demo-cart-total]")?.textContent?.trim() === "2"`)

    await page.evaluate(`(() => {
      const book = Array.from(document.querySelectorAll("button")).find(
        (button) => button.textContent?.trim() === "Book sample ticket"
      )
      if (!(book instanceof HTMLButtonElement)) throw new Error("Demo checkout missing")
      book.click()
      return true
    })()`)

    await page.waitFor(`document.body.textContent?.includes("Sample ticket #251 booked") === true`)

    await page.navigate("/contact")
    const contact = await page.evaluateJson<{
      hasForm: boolean
      path: string
    }>(`({
      hasForm: document.querySelector("form") !== null,
      path: location.pathname
    })`)
    assert.equal(contact.path, "/contact")
    assert.equal(contact.hasForm, true)

    await page.navigate("/terms")
    await page.waitFor(`location.pathname === "/terms"`)
    await page.navigate("/privacy")
    await page.waitFor(`location.pathname === "/privacy"`)

    assert.deepEqual(page.browserErrors, [])
  })
})
