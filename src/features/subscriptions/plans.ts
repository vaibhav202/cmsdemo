import {
  type SubscriptionPlanCode,
  subscriptionPlanCodes,
} from "@/features/subscriptions/schemas"

export type SubscriptionPlanDefinition = {
  code: SubscriptionPlanCode
  name: string
}

export const subscriptionPlans: readonly SubscriptionPlanDefinition[] =
  subscriptionPlanCodes.map((code) => ({
    code,
    name: code.charAt(0).toUpperCase() + code.slice(1),
  }))

export function getSubscriptionPlan(code: SubscriptionPlanCode) {
  return subscriptionPlans.find((plan) => plan.code === code)
}
