import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

import sharp from "sharp"

import {
  maxImageUploadBytes,
  MediaValidationError,
  normalizeMediaImage,
} from "../../src/lib/media/image-normalization.ts"

const fixtureDirectory = new URL("../fixtures/media/", import.meta.url)

const fixtures = [
  { fileName: "city-canteen-logo.jpg", mimeType: "image/jpeg" },
  { fileName: "city-canteen-logo.png", mimeType: "image/png" },
  { fileName: "city-canteen-logo.webp", mimeType: "image/webp" },
]

for (const fixture of fixtures) {
  test(`normalizes ${fixture.mimeType} input to bounded WebP`, async () => {
    const input = await readFile(new URL(fixture.fileName, fixtureDirectory))
    const result = await normalizeMediaImage({
      bytes: input,
      declaredMimeType: fixture.mimeType,
      purpose: "vendor-logo",
    })
    const metadata = await sharp(result.buffer).metadata()

    assert.equal(result.mimeType, "image/webp")
    assert.equal(metadata.format, "webp")
    assert.equal(metadata.width, 512)
    assert.equal(metadata.height, 512)
    assert.equal(metadata.exif, undefined)
    assert.ok(result.sizeBytes <= 150 * 1024)
  })
}

test("normalizes an avatar with the avatar byte budget", async () => {
  const input = await readFile(
    new URL("city-canteen-logo.jpg", fixtureDirectory)
  )
  const result = await normalizeMediaImage({
    bytes: input,
    declaredMimeType: "image/jpeg",
    purpose: "member-avatar",
  })

  assert.equal(result.width, 512)
  assert.equal(result.height, 512)
  assert.ok(result.sizeBytes <= 120 * 1024)
})

test("rejects a declared MIME type that does not match the bytes", async () => {
  const input = await readFile(
    new URL("city-canteen-logo.png", fixtureDirectory)
  )

  await assert.rejects(
    normalizeMediaImage({
      bytes: input,
      declaredMimeType: "image/jpeg",
      purpose: "vendor-logo",
    }),
    (error) =>
      error instanceof MediaValidationError && error.code === "mime-mismatch"
  )
})

test("rejects unsupported SVG input before decoding", async () => {
  await assert.rejects(
    normalizeMediaImage({
      bytes: Buffer.from(
        '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>'
      ),
      declaredMimeType: "image/svg+xml",
      purpose: "vendor-logo",
    }),
    (error) =>
      error instanceof MediaValidationError &&
      error.code === "mime-unsupported"
  )
})

test("rejects source files above the Vercel-safe upload budget", async () => {
  await assert.rejects(
    normalizeMediaImage({
      bytes: Buffer.alloc(maxImageUploadBytes + 1),
      declaredMimeType: "image/png",
      purpose: "vendor-logo",
    }),
    (error) =>
      error instanceof MediaValidationError &&
      error.code === "file-too-large"
  )
})
