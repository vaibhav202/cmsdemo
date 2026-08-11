import assert from "node:assert/strict"
import { test } from "node:test"

import { login, withFirefoxPage } from "./firefox-bidi"

test("kitchen member can move from the kitchen board to the queue in Firefox", async () => {
  await withFirefoxPage(async (page) => {
    await login(page, "kitchen@citycanteen.in", "Kitchen@2026")

    const kitchen = await page.evaluateJson<{
      hasKitchenLink: boolean
      hasOrderLink: boolean
      hasQueueLink: boolean
      path: string
      viewportFits: boolean
    }>(`({
      hasKitchenLink: Boolean(document.querySelector('a[href$="/kitchen"]')),
      hasOrderLink: Boolean(document.querySelector('a[href$="/order"]')),
      hasQueueLink: Boolean(document.querySelector('a[href$="/queue"]')),
      path: location.pathname,
      viewportFits:
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth
    })`)

    assert.equal(kitchen.path, "/app/city-canteen/kitchen")
    assert.equal(kitchen.hasKitchenLink, true)
    assert.equal(kitchen.hasQueueLink, true)
    assert.equal(kitchen.hasOrderLink, false)
    assert.equal(kitchen.viewportFits, true)

    await page.evaluate(`(() => {
      const queueLink = document.querySelector('a[href$="/queue"]')
      if (!queueLink) throw new Error("Queue navigation link was not rendered")
      queueLink.click()
      return true
    })()`)
    await page.waitFor(`location.pathname.endsWith("/queue")`, 8_000)
    await page.waitFor(
      `document.querySelector("h1")?.textContent?.trim() === "Queue Dashboard"`,
      8_000
    )

    const queue = await page.evaluateJson<{
      failed: boolean
      hasEmptyState: boolean
      path: string
      statusBadges: number
      viewportFits: boolean
    }>(`({
      failed: document.body.innerText.includes("Something went wrong"),
      hasEmptyState: Boolean(document.querySelector('[data-slot="empty"]')),
      path: location.pathname,
      statusBadges: document.querySelectorAll('[data-slot="badge"]').length,
      viewportFits:
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth
    })`)

    assert.equal(queue.path, "/app/city-canteen/queue")
    assert.equal(queue.failed, false)
    assert.equal(
      queue.statusBadges > 0 || queue.hasEmptyState,
      true,
      "the queue should render active statuses or its empty state"
    )
    assert.equal(queue.viewportFits, true)
    assert.deepEqual(page.browserErrors, [])
  })
})
