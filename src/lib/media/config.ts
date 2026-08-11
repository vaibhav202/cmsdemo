export const acceptedImageMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const

export type AcceptedImageMimeType = (typeof acceptedImageMimeTypes)[number]
export type MediaImagePurpose = "member-avatar" | "vendor-logo"
export type MediaUploadMode = "demo" | "production"

export const maxImageUploadBytes = 4_000_000
export const maxImageInputPixels = 40_000_000
export const normalizedImageSize = 512
