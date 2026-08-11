"use client"

import { useEffect, useId, useRef, useState } from "react"
import { ImageUp, LoaderCircle } from "lucide-react"
import { useTranslations } from "next-intl"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  acceptedImageMimeTypes,
  maxImageUploadBytes,
  type MediaUploadMode,
  type MediaImagePurpose,
} from "@/lib/media/config"

import {
  fileToDataUrl,
  readDemoMediaUrl,
  saveDemoMediaUrl,
} from "./demo-media-storage"

type UploadStatus =
  | { kind: "error"; message: string }
  | { kind: "idle"; message?: undefined }
  | { kind: "success"; message: string }

type MediaImageUploadFormProps = {
  currentUrl: string | null
  enabled: boolean
  fallback: string
  memberId?: string
  mode?: MediaUploadMode
  purpose: MediaImagePurpose
  vendorSlug: string
}

const apiErrorMessageKeys = {
  "auth-required": "errors.authRequired",
  "file-empty": "errors.fileEmpty",
  "file-missing": "errors.fileMissing",
  "file-too-large": "errors.fileTooLarge",
  "image-invalid": "errors.imageInvalid",
  "image-too-complex": "errors.imageTooComplex",
  "mime-mismatch": "errors.mimeMismatch",
  "mime-unsupported": "errors.mimeUnsupported",
  "origin-invalid": "errors.originInvalid",
  "output-too-large": "errors.outputTooLarge",
  "permission-denied": "errors.permissionDenied",
  "save-failed": "errors.saveFailed",
  "target-invalid": "errors.targetInvalid",
  "vendor-not-found": "errors.vendorNotFound",
} as const

function isKnownApiError(
  value: string
): value is keyof typeof apiErrorMessageKeys {
  return value in apiErrorMessageKeys
}

export function MediaImageUploadForm({
  currentUrl,
  enabled,
  fallback,
  memberId,
  mode = "production",
  purpose,
  vendorSlug,
}: MediaImageUploadFormProps) {
  const t = useTranslations("Media")
  const inputId = useId()
  const descriptionId = `${inputId}-description`
  const formRef = useRef<HTMLFormElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [savedUrl, setSavedUrl] = useState(currentUrl)
  const [pending, setPending] = useState(false)
  const [status, setStatus] = useState<UploadStatus>({ kind: "idle" })
  const isLogo = purpose === "vendor-logo"
  const isDemoMode = mode === "demo"
  const canUpload = enabled || isDemoMode

  useEffect(() => {
    if (!isDemoMode) return

    formRef.current?.setAttribute("data-media-ready", "true")

    const storedUrl = readDemoMediaUrl({ memberId, purpose, vendorSlug })
    if (!storedUrl) return

    const timeoutId = window.setTimeout(() => setSavedUrl(storedUrl), 0)

    return () => window.clearTimeout(timeoutId)
  }, [isDemoMode, memberId, purpose, vendorSlug])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function selectFile(nextFile: File | undefined) {
    if (previewUrl) URL.revokeObjectURL(previewUrl)

    setStatus({ kind: "idle" })
    setPreviewUrl(null)
    setFile(null)

    if (!nextFile) return

    if (
      !acceptedImageMimeTypes.some(
        (mimeType) => mimeType === nextFile.type
      )
    ) {
      setStatus({ kind: "error", message: t("errors.mimeUnsupported") })
      return
    }

    if (nextFile.size > maxImageUploadBytes) {
      setStatus({ kind: "error", message: t("errors.fileTooLarge") })
      return
    }

    setFile(nextFile)
    setPreviewUrl(URL.createObjectURL(nextFile))
  }

  async function submitUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canUpload) {
      setStatus({ kind: "error", message: t("errors.authRequired") })
      return
    }

    if (!file) {
      setStatus({ kind: "error", message: t("errors.fileMissing") })
      return
    }

    const formData = new FormData()
    formData.set("file", file)
    formData.set("purpose", purpose)
    formData.set("vendorSlug", vendorSlug)

    if (memberId) formData.set("memberId", memberId)

    setPending(true)
    setStatus({ kind: "idle" })

    try {
      if (isDemoMode) {
        const dataUrl = await fileToDataUrl(file)
        const stored = saveDemoMediaUrl(
          { memberId, purpose, vendorSlug },
          dataUrl
        )

        if (!stored) {
          setStatus({ kind: "error", message: t("errors.saveFailed") })
          return
        }

        setSavedUrl(dataUrl)
        setStatus({ kind: "success", message: t("demoSaved") })
        setFile(null)

        if (previewUrl) {
          URL.revokeObjectURL(previewUrl)
          setPreviewUrl(null)
        }

        return
      }

      const response = await fetch("/api/media", {
        body: formData,
        credentials: "same-origin",
        method: "POST",
      })
      const result = (await response.json().catch(() => null)) as {
        assetUrl?: string | null
        errorCode?: string
        status?: string
      } | null

      if (!response.ok || result?.status !== "success") {
        const key =
          result?.errorCode && isKnownApiError(result.errorCode)
            ? apiErrorMessageKeys[result.errorCode]
            : "errors.saveFailed"

        setStatus({ kind: "error", message: t(key) })
        return
      }

      if (result.assetUrl) setSavedUrl(result.assetUrl)
      setStatus({
        kind: "success",
        message: t(isLogo ? "logoSaved" : "avatarSaved"),
      })
      setFile(null)

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
    } catch {
      setStatus({ kind: "error", message: t("errors.saveFailed") })
    } finally {
      setPending(false)
    }
  }

  return (
    <form
      className="flex flex-col gap-4"
      data-media-mode={mode}
      onSubmit={submitUpload}
      ref={formRef}
    >
      <div className="flex items-center gap-3">
        <Avatar className="size-16" size="lg">
          <AvatarImage
            alt={t(isLogo ? "logoAlt" : "avatarAlt")}
            src={previewUrl ?? savedUrl ?? undefined}
          />
          <AvatarFallback className="bg-vendor-brand text-lg text-vendor-brand-foreground">
            {fallback}
          </AvatarFallback>
        </Avatar>
        <p className="text-sm leading-6 text-muted-foreground">
          {t(isLogo ? "logoHelp" : "avatarHelp")}
        </p>
      </div>

      <FieldGroup>
        <Field
          data-disabled={!canUpload}
          data-invalid={status.kind === "error"}
        >
          <FieldLabel htmlFor={inputId}>
            {t(isLogo ? "logoLabel" : "avatarLabel")}
          </FieldLabel>
          <Input
            accept={acceptedImageMimeTypes.join(",")}
            aria-describedby={descriptionId}
            aria-invalid={status.kind === "error"}
            disabled={!canUpload || pending}
            id={inputId}
            name="file"
            onChange={(event) => selectFile(event.target.files?.[0])}
            type="file"
          />
          <FieldDescription id={descriptionId}>
            {canUpload ? t("formatHelp") : t("authHelp")}
          </FieldDescription>
          {status.kind === "error" ? (
            <FieldError>{status.message}</FieldError>
          ) : null}
        </Field>
      </FieldGroup>

      {status.kind === "success" ? (
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {status.message}
        </p>
      ) : null}

      <Button disabled={!canUpload || !file || pending} type="submit">
        {pending ? (
          <LoaderCircle className="animate-spin" data-icon="inline-start" />
        ) : (
          <ImageUp data-icon="inline-start" />
        )}
        {t(pending ? "uploading" : "upload")}
      </Button>
    </form>
  )
}
