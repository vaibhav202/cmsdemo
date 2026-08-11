import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"

export const publicMediaBucket = "vendor-public-assets"
export const privateMediaBucket = "vendor-private-assets"

export async function getCurrentMemberMedia(vendorId: string) {
  if (
    process.env.NODE_ENV === "development" &&
    process.env.E2E_USE_FIXTURES === "1"
  ) {
    return null
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: member, error: memberError } = await supabase
    .from("vendor_members")
    .select("id, avatar_asset_id")
    .eq("vendor_id", vendorId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle()

  if (memberError || !member) return null
  if (!member.avatar_asset_id) {
    return { avatarUrl: null, memberId: member.id }
  }

  const { data: asset, error: assetError } = await supabase
    .from("media_assets")
    .select("bucket, object_path")
    .eq("id", member.avatar_asset_id)
    .eq("vendor_id", vendorId)
    .maybeSingle()

  if (
    assetError ||
    !asset ||
    asset.bucket !== privateMediaBucket
  ) {
    return { avatarUrl: null, memberId: member.id }
  }

  const { data: signedAsset, error: signedAssetError } = await supabase.storage
    .from(privateMediaBucket)
    .createSignedUrl(asset.object_path, 60 * 60)

  return {
    avatarUrl: signedAssetError ? null : signedAsset.signedUrl,
    memberId: member.id,
  }
}
