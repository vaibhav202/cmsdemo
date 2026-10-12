import assert from "node:assert/strict"
import { test } from "node:test"

import { type BrowserPage, withFirefoxPage } from "./firefox-bidi"

const localizedHomeViewports = [
  { height: 844, label: "phone", width: 390 },
  { height: 1_000, label: "desktop", width: 1_440 },
] as const

const indicLocales = ["mr-IN", "hi-IN", "gu-IN"] as const

async function readLocalizedHomeLayout(page: BrowserPage) {
  return page.evaluateJson<{
    badgeOverflow: number
    featureCards: number
    horizontalOverflow: number
    overflowingElements: string[]
    tickerClipped: boolean
    tickerHeight: number
  }>(`(() => {
    const root = document.documentElement
    const ticker = document.querySelector(
      "[data-public-ticker] [aria-hidden='true']"
    )
    const activeTickerItem = ticker?.lastElementChild
    const tickerBounds = ticker?.getBoundingClientRect()
    const activeTickerBounds = activeTickerItem?.getBoundingClientRect()
    const badgeOverflow = Array.from(
      document.querySelectorAll("[data-slot='badge']")
    ).filter((badge) => {
      const styles = getComputedStyle(badge)
      return (
        styles.overflowY === "hidden" ||
        badge.scrollHeight > badge.clientHeight + 1
      )
    }).length

    const overflowingElements = Array.from(document.body.querySelectorAll("*"))
      .filter((element) => {
        const bounds = element.getBoundingClientRect()
        return bounds.left < -1 || bounds.right > root.clientWidth + 1
      })
      .slice(0, 8)
      .map((element) => {
        const bounds = element.getBoundingClientRect()
        const label = element.getAttribute("data-slot") ?? element.tagName.toLowerCase()
        const text = element.textContent?.trim().replace(/\\s+/g, " ").slice(0, 40) ?? ""
        return (
          label +
          " [" +
          Math.round(bounds.left) +
          ", " +
          Math.round(bounds.right) +
          "]: " +
          text
        )
      })

    return {
      badgeOverflow,
      featureCards: document.querySelectorAll("[data-home-feature]").length,
      horizontalOverflow:
        Math.max(root.scrollWidth, document.body.scrollWidth) - root.clientWidth,
      overflowingElements,
      tickerClipped:
        !tickerBounds ||
        !activeTickerBounds ||
        activeTickerBounds.top < tickerBounds.top - 1 ||
        activeTickerBounds.bottom > tickerBounds.bottom + 1,
      tickerHeight: tickerBounds?.height ?? 0,
    }
  })()`)
}

test("localized homepage avoids clipping and horizontal overflow", async () => {
  await withFirefoxPage(async (page) => {
    for (const locale of indicLocales) {
      await page.setCookie("cms_platform_locale", locale)

      for (const viewport of localizedHomeViewports) {
        await page.setViewport(viewport.width, viewport.height)
        await page.navigate("/")
        await page.waitFor(
          `document.querySelectorAll("[data-home-feature]").length === 3`
        )

        await page.evaluate(`(async () => {
          await document.fonts.ready
          document.documentElement.style.fontSize = "200%"
          await new Promise((resolve) => requestAnimationFrame(() =>
            requestAnimationFrame(resolve)
          ))
        })()`)

        const before = await readLocalizedHomeLayout(page)
        const activeText = await page.evaluateJson<string>(
          `document.querySelector("[data-public-ticker] [aria-hidden='true'] > span:last-child")?.textContent?.trim() ?? ""`
        )

        await page.waitFor(
          `document.querySelector("[data-public-ticker] [aria-hidden='true'] > span:last-child")?.textContent?.trim() !== ${JSON.stringify(activeText)}`,
          4_000
        )
        await page.evaluate(
          `new Promise((resolve) => window.setTimeout(resolve, 600))`
        )

        const after = await readLocalizedHomeLayout(page)
        const context = `${locale} ${viewport.label}`

        assert.equal(after.featureCards, 3, `${context}: feature cards`)
        assert.equal(after.badgeOverflow, 0, `${context}: badge overflow`)
        assert.equal(
          after.horizontalOverflow,
          0,
          `${context}: horizontal overflow (${after.overflowingElements.join(" | ")})`
        )
        assert.equal(after.tickerClipped, false, `${context}: ticker clipping`)
        assert.ok(
          Math.abs(after.tickerHeight - before.tickerHeight) <= 1,
          `${context}: ticker height changed during rotation (${before.tickerHeight} -> ${after.tickerHeight})`
        )
      }
    }

    assert.deepEqual(page.browserErrors, [])
  })
})

test("public homepage and demo stay anonymous and interactive", async () => {
  await withFirefoxPage(async (page) => {
    await page.setCookie("cms_platform_locale", "en-IN")
    await page.navigate("/")

    const home = await page.evaluateJson<{
      capabilityCards: number
      hasDemoLink: boolean
      hasLoginLink: boolean
      path: string
    }>(`({
      capabilityCards: document.querySelectorAll("[data-home-feature]").length,
      hasDemoLink: Array.from(document.querySelectorAll("a")).some(
        (link) => link.getAttribute("href") === "/demo"
      ),
      hasLoginLink: Array.from(document.querySelectorAll("a")).some(
        (link) => link.getAttribute("href") === "/login"
      ),
      path: location.pathname
    })`)

    assert.equal(home.path, "/")
    assert.equal(home.capabilityCards, 3)
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
