import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  isValidPilotInquiryPayload,
  readPilotInquiryPayload,
} from "../../src/features/pilot-inquiries/validation"

function validInput(overrides: Record<string, unknown> = {}) {
  return {
    businessName: "City Canteen",
    city: "Pune",
    consent: true,
    email: "owner@citycanteen.in",
    message: "Please share the pilot details.",
    name: "Asha Patil",
    phone: "+919876543210",
    website: "",
    ...overrides,
  }
}

describe("pilot inquiry validation", () => {
  it("normalizes supported text values without changing their content length", () => {
    const payload = readPilotInquiryPayload(
      validInput({ message: `  ${"x".repeat(1_000)}  ` })
    )

    assert.equal(payload.message.length, 1_000)
    assert.equal(isValidPilotInquiryPayload(payload), true)
  })

  it("rejects oversized fields instead of silently truncating them", () => {
    const payload = readPilotInquiryPayload(
      validInput({ message: "x".repeat(1_001) })
    )

    assert.equal(payload.message.length, 1_001)
    assert.equal(isValidPilotInquiryPayload(payload), false)
  })

  it("requires consent and a valid email", () => {
    assert.equal(
      isValidPilotInquiryPayload(
        readPilotInquiryPayload(validInput({ consent: false }))
      ),
      false
    )
    assert.equal(
      isValidPilotInquiryPayload(
        readPilotInquiryPayload(validInput({ email: "not-an-email" }))
      ),
      false
    )
  })
})
