import { randomUUID } from "node:crypto"

import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"

import {
  MediaValidationError,
  normalizeMediaImage,
} from "@/lib/media/image-normalization"
import {
  maxImageUploadBytes,
  type MediaImagePurpose,
} from "@/lib/media/config"
import {
  privateMediaBucket,
  publicMediaBucket,
} from "@/lib/media/assets"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const maxDuration = 20

const managerRoles = new Set(["admin", "manager", "owner"])
const maximumMultipartBytes = 4_400_000

type ApiErrorCode =
  | "auth-required"
  | "file-empty"
  | "file-missing"
  | "file-too-large"
  | "image-invalid"
  | "image-too-complex"
  | "mime-mismatch"
  | "mime-unsupported"
  | "origin-invalid"
  | "output-too-large"
  | "permission-denied"
  | "save-failed"
  | "target-invalid"
  | "vendor-not-found"

function errorResponse(
  errorCode: ApiErrorCode,
  status: number,
  message: string
) {
  return NextResponse.json(
    { errorCode, message, status: "error" },
    { status }
  )
}

function isMediaPurpose(value: FormDataEntryValue | null): value is MediaImagePurpose {
  return value === "member-avatar" || value === "vendor-logo"
}

function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin")

  if (!origin) return true

  try {
    const originUrl = new URL(origin)
    const requestUrl = new URL(request.url)
    const forwardedHost = request.headers
      .get("x-forwarded-host")
      ?.split(",")[0]
      .trim()
    const forwardedProtocol = request.headers
      .get("x-forwarded-proto")
      ?.split(",")[0]
      .trim()
    const requestHost =
      forwardedHost ?? request.headers.get("host") ?? requestUrl.host
    const requestProtocol = forwardedProtocol
      ? `${forwardedProtocol}:`
      : requestUrl.protocol

    return (
      originUrl.host === requestHost &&
      originUrl.protocol === requestProtocol
    )
  } catch {
    return false
  }
}

async function removeStoredAsset({
  assetId,
  bucket,
  objectPath,
}: {
  assetId?: string | null
  bucket: string
  objectPath: string
}) {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.storage.from(bucket).remove([objectPath])

  if (error) {
    console.error("Unable to remove superseded media object", error)
    return
  }

  if (assetId) {
    const { error: metadataError } = await supabase
      .from("media_assets")
      .delete()
      .eq("id", assetId)

    if (metadataError) {
      console.error(
        "Unable to remove superseded media metadata",
        metadataError
      )
    }
  }
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return errorResponse("origin-invalid", 403, "The upload origin is invalid.")
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0")

  if (contentLength > maximumMultipartBytes) {
    return errorResponse(
      "file-too-large",
      413,
      "The upload request exceeds the server limit."
    )
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return errorResponse(
      "auth-required",
      401,
      "A production Supabase session is required for media uploads."
    )
  }

  let formData: FormData

  try {
    formData = await request.formData()
  } catch {
    return errorResponse("image-invalid", 400, "The upload body is invalid.")
  }

  const file = formData.get("file")
  const purpose = formData.get("purpose")
  const vendorSlug = String(formData.get("vendorSlug") ?? "").trim()

  if (!(file instanceof File)) {
    return errorResponse("file-missing", 400, "Choose an image to upload.")
  }

  if (file.size > maxImageUploadBytes) {
    return errorResponse("file-too-large", 413, "The image is too large.")
  }

  if (!isMediaPurpose(purpose)) {
    return errorResponse("target-invalid", 400, "The media target is invalid.")
  }

  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select("id, logo_asset_id, logo_url")
    .eq("slug", vendorSlug)
    .eq("status", "active")
    .maybeSingle()

  if (vendorError || !vendor) {
    return errorResponse(
      "vendor-not-found",
      404,
      "The vendor workspace was not found."
    )
  }

  const { data: actorMembership, error: actorMembershipError } = await supabase
    .from("vendor_members")
    .select("id, role")
    .eq("vendor_id", vendor.id)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle()

  if (actorMembershipError || !actorMembership) {
    return errorResponse(
      "permission-denied",
      403,
      "An active vendor membership is required."
    )
  }

  let targetMember:
    | { avatar_asset_id: string | null; id: string; user_id: string }
    | null = null

  if (purpose === "vendor-logo") {
    if (!managerRoles.has(actorMembership.role)) {
      return errorResponse(
        "permission-denied",
        403,
        "This role cannot change the vendor logo."
      )
    }
  } else {
    const memberId = String(formData.get("memberId") ?? "").trim()
    const { data, error } = await supabase
      .from("vendor_members")
      .select("id, user_id, avatar_asset_id")
      .eq("id", memberId)
      .eq("vendor_id", vendor.id)
      .maybeSingle()

    if (error || !data) {
      return errorResponse(
        "target-invalid",
        404,
        "The member profile was not found."
      )
    }

    if (data.user_id !== user.id && !managerRoles.has(actorMembership.role)) {
      return errorResponse(
        "permission-denied",
        403,
        "This role cannot change that member avatar."
      )
    }

    targetMember = data
  }

  let normalizedImage

  try {
    normalizedImage = await normalizeMediaImage({
      bytes: await file.arrayBuffer(),
      declaredMimeType: file.type,
      purpose,
    })
  } catch (error) {
    if (error instanceof MediaValidationError) {
      const status = error.code === "file-too-large" ? 413 : 422
      return errorResponse(error.code, status, error.message)
    }

    console.error("Unable to normalize uploaded image", error)
    return errorResponse(
      "image-invalid",
      422,
      "The image could not be normalized."
    )
  }

  const assetId = randomUUID()
  const bucket =
    purpose === "vendor-logo" ? publicMediaBucket : privateMediaBucket

  let objectPath: string

  if (purpose === "vendor-logo") {
    objectPath = `vendors/${vendor.id}/logos/${assetId}.webp`
  } else {
    if (!targetMember) {
      return errorResponse(
        "target-invalid",
        404,
        "The member profile was not found."
      )
    }

    objectPath =
      `vendors/${vendor.id}/members/${targetMember.id}/${assetId}.webp`
  }

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(objectPath, normalizedImage.buffer, {
      cacheControl: "31536000",
      contentType: normalizedImage.mimeType,
      upsert: false,
    })

  if (uploadError) {
    console.error("Unable to upload normalized media object", uploadError)
    return errorResponse(
      "save-failed",
      500,
      "The optimized image could not be stored."
    )
  }

  const { error: assetError } = await supabase.from("media_assets").insert({
    bucket,
    created_by: user.id,
    height: normalizedImage.height,
    id: assetId,
    mime_type: normalizedImage.mimeType,
    object_path: objectPath,
    purpose: purpose === "vendor-logo" ? "vendor_logo" : "member_avatar",
    size_bytes: normalizedImage.sizeBytes,
    vendor_id: vendor.id,
    width: normalizedImage.width,
  })

  if (assetError) {
    console.error("Unable to save media metadata", assetError)
    await removeStoredAsset({ bucket, objectPath })
    return errorResponse(
      "save-failed",
      500,
      "The optimized image metadata could not be saved."
    )
  }

  let assetUrl: string | null = null
  let previousAssetId: string | null = null

  if (purpose === "vendor-logo") {
    assetUrl = supabase.storage.from(bucket).getPublicUrl(objectPath).data.publicUrl
    previousAssetId = vendor.logo_asset_id

    const { error } = await supabase
      .from("vendors")
      .update({ logo_asset_id: assetId, logo_url: assetUrl })
      .eq("id", vendor.id)

    if (error) {
      console.error("Unable to link vendor logo", error)
      await removeStoredAsset({ assetId, bucket, objectPath })
      return errorResponse(
        "save-failed",
        500,
        "The optimized logo could not be linked."
      )
    }
  } else if (targetMember) {
    previousAssetId = targetMember.avatar_asset_id

    const { error } = await supabase
      .from("vendor_members")
      .update({ avatar_asset_id: assetId })
      .eq("id", targetMember.id)
      .eq("vendor_id", vendor.id)

    if (error) {
      console.error("Unable to link member avatar", error)
      await removeStoredAsset({ assetId, bucket, objectPath })
      return errorResponse(
        "save-failed",
        500,
        "The optimized avatar could not be linked."
      )
    }

    const { data: signedAsset, error: signedAssetError } =
      await supabase.storage
        .from(bucket)
        .createSignedUrl(objectPath, 60 * 60)

    if (!signedAssetError) {
      assetUrl = signedAsset.signedUrl
    }
  }

  if (previousAssetId && previousAssetId !== assetId) {
    const { data: previousAsset } = await supabase
      .from("media_assets")
      .select("bucket, object_path")
      .eq("id", previousAssetId)
      .eq("vendor_id", vendor.id)
      .maybeSingle()

    if (previousAsset) {
      await removeStoredAsset({
        assetId: previousAssetId,
        bucket: previousAsset.bucket,
        objectPath: previousAsset.object_path,
      })
    }
  }

  revalidatePath(`/app/${vendorSlug}`, "layout")
  revalidatePath(`/app/${vendorSlug}/control`)

  return NextResponse.json({
    assetId,
    assetUrl,
    height: normalizedImage.height,
    mimeType: normalizedImage.mimeType,
    sizeBytes: normalizedImage.sizeBytes,
    status: "success",
    width: normalizedImage.width,
  })
}
