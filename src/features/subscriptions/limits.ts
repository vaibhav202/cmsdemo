export type LimitEvaluation = {
  allowed: boolean
  limitValue: number | null
  remaining: number | null
  usage: number
}

export function evaluateLimit(
  usage: number,
  limitValue: number | null,
  requested = 1
): LimitEvaluation {
  if (
    !Number.isSafeInteger(usage) ||
    usage < 0 ||
    !Number.isSafeInteger(requested) ||
    requested < 1
  ) {
    throw new Error("Usage and requested capacity must be non-negative integers.")
  }

  if (limitValue === null) {
    return {
      allowed: true,
      limitValue,
      remaining: null,
      usage,
    }
  }

  if (!Number.isSafeInteger(limitValue) || limitValue < 0) {
    throw new Error("Subscription limits must be non-negative integers.")
  }

  return {
    allowed: usage + requested <= limitValue,
    limitValue,
    remaining: Math.max(limitValue - usage, 0),
    usage,
  }
}
