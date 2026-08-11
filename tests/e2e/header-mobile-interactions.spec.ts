import assert from "node:assert/strict"
import { test } from "node:test"

import { login, withFirefoxPage } from "./firefox-bidi"

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
