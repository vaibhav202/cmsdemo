import sharp from "sharp"

import {
  acceptedImageMimeTypes,
  maxImageInputPixels,
  maxImageUploadBytes,
  normalizedImageSize,
  type AcceptedImageMimeType,
  type MediaImagePurpose,
} from "./config"

export {
  acceptedImageMimeTypes,
  maxImageInputPixels,
  maxImageUploadBytes,
  normalizedImageSize,
  type AcceptedImageMimeType,
  type MediaImagePurpose,
} from "./config"

const outputByteLimits: Record<MediaImagePurpose, number> = {
  "member-avatar": 120 * 1024,
  "vendor-logo": 150 * 1024,
}

const detectedMimeTypes = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
} as const

const qualitySteps = [82, 76, 70, 64, 58] as const

export type MediaValidationCode =
  | "file-empty"
  | "file-too-large"
  | "image-invalid"
  | "image-too-complex"
  | "mime-mismatch"
  | "mime-unsupported"
  | "output-too-large"

export class MediaValidationError extends Error {
  readonly code: MediaValidationCode

  constructor(code: MediaValidationCode, message: string) {
    super(message)
    this.code = code
    this.name = "MediaValidationError"
  }
}

export type NormalizedImage = {
  buffer: Buffer
  height: number
  mimeType: "image/webp"
  sizeBytes: number
  width: number
}

function isAcceptedMimeType(value: string): value is AcceptedImageMimeType {
  return acceptedImageMimeTypes.some((mimeType) => mimeType === value)
}

function getDetectedMimeType(
  format: keyof typeof detectedMimeTypes | undefined
) {
  return format ? detectedMimeTypes[format] : undefined
}

async function renderWebp(
  input: Buffer,
  purpose: MediaImagePurpose,
  quality: number
) {
  const fit = purpose === "vendor-logo" ? "contain" : "cover"
  const position = purpose === "vendor-logo" ? "center" : sharp.strategy.attention
  const preset = purpose === "vendor-logo" ? "icon" : "photo"

  return sharp(input, {
    autoOrient: true,
    failOn: "warning",
    limitInputChannels: 4,
    limitInputPixels: maxImageInputPixels,
    pages: 1,
    sequentialRead: true,
  })
    .resize({
      background: { alpha: 0, b: 0, g: 0, r: 0 },
      fit,
      height: normalizedImageSize,
      position,
      width: normalizedImageSize,
    })
    .toColourspace("srgb")
    .webp({
      alphaQuality: 92,
      effort: 6,
      preset,
      quality,
      smartSubsample: true,
    })
    .toBuffer({ resolveWithObject: true })
}

export async function normalizeMediaImage({
  bytes,
  declaredMimeType,
  purpose,
}: {
  bytes: ArrayBuffer | Buffer | Uint8Array
  declaredMimeType: string
  purpose: MediaImagePurpose
}): Promise<NormalizedImage> {
  const input = Buffer.isBuffer(bytes)
    ? bytes
    : bytes instanceof ArrayBuffer
      ? Buffer.from(bytes)
      : Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength)

  if (!input.byteLength) {
    throw new MediaValidationError("file-empty", "The image file is empty.")
  }

  if (input.byteLength > maxImageUploadBytes) {
    throw new MediaValidationError(
      "file-too-large",
      "The image exceeds the upload limit."
    )
  }

  if (!isAcceptedMimeType(declaredMimeType)) {
    throw new MediaValidationError(
      "mime-unsupported",
      "Only JPEG, PNG, and WebP images are accepted."
    )
  }

  let metadata: Awaited<ReturnType<ReturnType<typeof sharp>["metadata"]>>

  try {
    metadata = await sharp(input, {
      failOn: "warning",
      limitInputChannels: 4,
      limitInputPixels: maxImageInputPixels,
      pages: 1,
      sequentialRead: true,
    }).metadata()
  } catch (error) {
    const message = error instanceof Error ? error.message : ""
    const code = /pixel limit|image exceeds pixel limit/i.test(message)
      ? "image-too-complex"
      : "image-invalid"

    throw new MediaValidationError(code, "The image could not be decoded.")
  }

  const detectedMimeType = getDetectedMimeType(
    metadata.format as keyof typeof detectedMimeTypes | undefined
  )

  if (!detectedMimeType) {
    throw new MediaValidationError(
      "mime-unsupported",
      "The decoded image format is not supported."
    )
  }

  if (detectedMimeType !== declaredMimeType) {
    throw new MediaValidationError(
      "mime-mismatch",
      "The file contents do not match the declared image type."
    )
  }

  if (
    !metadata.width ||
    !metadata.height ||
    metadata.width > 10_000 ||
    metadata.height > 10_000 ||
    metadata.width * metadata.height > maxImageInputPixels ||
    (metadata.pages ?? 1) > 1
  ) {
    throw new MediaValidationError(
      "image-too-complex",
      "The image dimensions or frame count are not supported."
    )
  }

  const outputLimit = outputByteLimits[purpose]

  for (const quality of qualitySteps) {
    const { data, info } = await renderWebp(input, purpose, quality)

    if (info.size <= outputLimit) {
      return {
        buffer: data,
        height: info.height,
        mimeType: "image/webp",
        sizeBytes: info.size,
        width: info.width,
      }
    }
  }

  throw new MediaValidationError(
    "output-too-large",
    "The normalized image could not meet the output size limit."
  )
}
