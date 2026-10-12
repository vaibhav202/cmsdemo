import assert from "node:assert/strict"
import { test } from "node:test"

import { login, withFirefoxPage } from "./firefox-bidi"

test("cart stays available as an overlay outside the order module", async () => {
  await withFirefoxPage(async (page) => {
    await page.setViewport(1_440, 1_000)
    await login(page, "cashier@citycanteen.in", "Cashier@2026")
    await page.waitFor(
      'document.querySelector(\'form[id^="order-form-"]\') !== null'
    )

    await page.evaluate(`(() => {
      const form = document.querySelector('form[id^="order-form-"]')
      const button = form?.querySelector('button[type="submit"]')
      if (!(button instanceof HTMLButtonElement)) throw new Error("Order item missing")
      button.click()
      return true
    })()`)
    await page.waitFor('document.querySelectorAll("[data-cart-line]").length === 1')

    await page.evaluate(`(() => {
      const link = document.querySelector('a[href="/app/city-canteen/queue"]')
      if (!(link instanceof HTMLAnchorElement)) throw new Error("Queue link missing")
      link.click()
      return true
    })()`)
    await page.waitFor('location.pathname === "/app/city-canteen/queue"')

    const desktopCartButton = await page.evaluateJson<boolean>(`Boolean(
      Array.from(document.querySelectorAll('button[aria-label="Open cart"]')).find(
        (button) => getComputedStyle(button).display !== "none"
      )
    )`)
    assert.equal(desktopCartButton, true)

    await page.evaluate(`Array.from(
      document.querySelectorAll('button[aria-label="Open cart"]')
    ).find((button) => getComputedStyle(button).display !== "none")?.click()`)
    await page.waitFor('document.querySelector("[data-cart-sheet]") !== null')
    assert.equal(
      await page.evaluateJson<number>(
        'document.querySelectorAll("[data-cart-sheet] [data-cart-line]").length'
      ),
      1
    )

    await page.evaluate(
      'document.querySelector("[data-cart-sheet] [data-slot=sheet-close]")?.click()'
    )
    await page.waitFor('document.querySelector("[data-cart-sheet]") === null')

    await page.setViewport(430, 932)
    const hasActiveModuleIcon = await page.evaluateJson<boolean>(
      'Boolean(document.querySelector("[data-mobile-navigation] [data-mobile-active-module-icon]"))'
    )
    const hasActiveOrdersButton = await page.evaluateJson<boolean>(
      `Array.from(document.querySelectorAll(
        '[data-mobile-navigation] button[data-mobile-active-orders]'
      )).some((button) => getComputedStyle(button).display !== "none")`
    )
    const hasAccountButton = await page.evaluateJson<boolean>(
      `Array.from(document.querySelectorAll(
        '[data-mobile-navigation] button[aria-label="Open account"]'
      )).some((button) => getComputedStyle(button).display !== "none")`
    )
    const hasCartButton = await page.evaluateJson<boolean>(
      `Array.from(document.querySelectorAll(
        '[data-mobile-navigation] button[aria-label="Open cart"]'
      )).some((button) => getComputedStyle(button).display !== "none")`
    )
    const moduleGap = await page.evaluateJson<number>(
      'Number.parseFloat(getComputedStyle(document.querySelector("[data-mobile-module-group]")).gap)'
    )
    const moduleLabel = await page.evaluateJson<string>(
      'document.querySelector("[data-mobile-active-module]")?.textContent?.trim() ?? ""'
    )
    const outletNameVisible = await page.evaluateJson<boolean>(
      'Boolean(document.querySelector("[data-mobile-navigation]")?.textContent?.includes("City Canteen"))'
    )

    assert.equal(hasActiveModuleIcon, true)
    assert.equal(hasActiveOrdersButton, true)
    assert.equal(hasAccountButton, true)
    assert.equal(hasCartButton, true)
    assert.ok(moduleGap > 0)
    assert.equal(moduleLabel, "Queue")
    assert.equal(outletNameVisible, false)

    await page.evaluate(`Array.from(
      document.querySelectorAll('button[aria-label="Open cart"]')
    ).find((button) => getComputedStyle(button).display !== "none")?.click()`)
    await page.waitFor('document.querySelector("[data-cart-sheet]") !== null')
    assert.equal(
      await page.evaluateJson<number>(
        'document.querySelectorAll("[data-cart-sheet] [data-cart-line]").length'
      ),
      1
    )
    assert.ok(
      await page.evaluateJson<number>(
        'document.querySelector("[data-cart-sheet]")?.getBoundingClientRect().width ?? 0'
      ) >= 430 * 0.9,
      "cart sheet should use most of the mobile viewport"
    )

    await page.evaluate(
      'document.querySelector("[data-cart-sheet] [data-slot=sheet-footer] [data-slot=sheet-close]")?.click()'
    )
    await page.waitFor('document.querySelector("[data-cart-sheet]") === null')

    await page.evaluate(`Array.from(
      document.querySelectorAll('button[data-mobile-active-orders]')
    ).find((button) => getComputedStyle(button).display !== "none")?.click()`)
    await page.waitFor(
      'document.querySelector("[data-active-orders-sheet]") !== null'
    )
    assert.ok(
      await page.evaluateJson<number>(
        'document.querySelector("[data-active-orders-sheet]")?.getBoundingClientRect().width ?? 0'
      ) >= 430 * 0.9,
      "active orders sheet should use most of the mobile viewport"
    )

    await page.evaluate(
      'document.querySelector("[data-active-orders-sheet] [data-slot=sheet-footer] [data-slot=sheet-close]")?.click()'
    )
    await page.waitFor(
      'document.querySelector("[data-active-orders-sheet]") === null'
    )

    assert.deepEqual(page.browserErrors, [])
  })
})

test("login appearance and mobile shell controls are interactive in Firefox", async () => {
  await withFirefoxPage(async (page) => {
    await page.navigate("/login")
    await page.waitFor('document.querySelector(\'button[aria-label="Light theme"]\')')

    const loginControls = await page.evaluateJson<{
      hasThemeOptions: boolean
      hasLanguageButton: boolean
    }>(`({
      hasThemeOptions: document.querySelectorAll('button[aria-label$="theme"]').length === 3,
      hasLanguageButton: Boolean(document.querySelector('button[aria-label="Select your language"]')),
    })`)

    assert.equal(loginControls.hasThemeOptions, true)
    assert.equal(loginControls.hasLanguageButton, true)

    await page.evaluate(`document.querySelector('button[aria-label="Dark theme"]')?.click()`)
    await page.waitFor('document.documentElement.classList.contains("dark")')

    await login(page, "owner@citycanteen.in", "Owner@2026")
    await page.waitFor('document.querySelector(\'button[aria-label="Open menu"]\')')

    await page.evaluate(`document.querySelector('button[aria-label="Open menu"]')?.click()`)
    await page.waitFor(
      'document.querySelector(\'[data-slot="sheet-content"]\')?.textContent?.includes("Menu")'
    )

    const menuIsVisible = await page.evaluateJson<boolean>(
      'Boolean(document.querySelector(\'[data-slot="sheet-content"]\'))'
    )
    assert.equal(menuIsVisible, true)

    await page.evaluate(
      'document.querySelector(\'[data-slot="sheet-content"] button\')?.click()'
    )
    await page.waitFor(
      'document.querySelector(\'[data-slot="sheet-content"]\') === null'
    )

    await page.evaluate(`document.querySelector('button[aria-label="Open account"]')?.click()`)
    await page.waitFor(
      'document.querySelector(\'[data-slot="sheet-content"]\')?.textContent?.includes("Account")'
    )

    assert.deepEqual(page.browserErrors, [])
  })
})
