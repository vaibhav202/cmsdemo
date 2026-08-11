import type { ProviderSubscriptionSnapshot } from "@/features/subscriptions/provider-sync"

export type VerifiedSubscriptionWebhook = {
  eventId: string
  subscription: ProviderSubscriptionSnapshot
}

export type SubscriptionWebhookAdapter = {
  verifyAndParse(
    request: Request
  ): Promise<VerifiedSubscriptionWebhook>
}

export type SubscriptionWebhookStore = {
  hasProcessed(eventId: string): Promise<boolean>
  synchronize(event: VerifiedSubscriptionWebhook): Promise<void>
}

export type SubscriptionWebhookResult =
  | { status: "duplicate" }
  | { status: "processed" }

export async function handleSubscriptionWebhook(
  request: Request,
  adapter: SubscriptionWebhookAdapter,
  store: SubscriptionWebhookStore
): Promise<SubscriptionWebhookResult> {
  const event = await adapter.verifyAndParse(request)

  if (await store.hasProcessed(event.eventId)) {
    return { status: "duplicate" }
  }

  // The store owns the database transaction. It must persist the provider event
  // id and the subscription/entitlement projection atomically.
  await store.synchronize(event)

  return { status: "processed" }
}
