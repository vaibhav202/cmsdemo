import type { MediaImagePurpose } from "@/lib/media/config"

const storageKeyPrefix = "cms-platform:demo-media"

function getStorageKey({
  memberId,
  purpose,
  vendorSlug,
}: {
  memberId?: string
  purpose: MediaImagePurpose
  vendorSlug: string
}) {
  return [storageKeyPrefix, vendorSlug, purpose, memberId ?? "owner"].join(":")
}

export function readDemoMediaUrl(options: {
  memberId?: string
  purpose: MediaImagePurpose
  vendorSlug: string
}) {
  if (typeof window === "undefined") return null

  try {
    return window.localStorage.getItem(getStorageKey(options))
  } catch {
    return null
  }
}

export function saveDemoMediaUrl(
  options: {
    memberId?: string
    purpose: MediaImagePurpose
    vendorSlug: string
  },
  dataUrl: string
) {
  if (typeof window === "undefined") return false

  try {
    window.localStorage.setItem(getStorageKey(options), dataUrl)
    return true
  } catch {
    return false
  }
}

export function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.addEventListener("error", () => reject(new Error("file-read-failed")))
    reader.addEventListener("load", () => {
      if (typeof reader.result !== "string") {
        reject(new Error("file-read-failed"))
        return
      }

      resolve(reader.result)
    })
    reader.readAsDataURL(file)
  })
}
