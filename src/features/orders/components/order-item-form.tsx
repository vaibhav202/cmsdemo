"use client"

import { ReceiptText } from "lucide-react"
import { useTranslations } from "next-intl"
import {
  type FormEvent,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react"
import { toast } from "sonner"

import { createOrderAction } from "@/features/orders/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { MenuItemWithCategory } from "@/lib/supabase/types"

import { useDashboardFormats } from "@/components/dashboard/shared/format"

type OrderItemFormProps = {
  item: MenuItemWithCategory
  vendorId: string
  vendorSlug: string
}

const ORDER_UNDO_DELAY_MS = 10_000

function restoreScroll(scrollY: number) {
  const startedAt = Date.now()

  function restore() {
    window.scrollTo({ left: 0, top: scrollY })

    if (Date.now() - startedAt < 600) {
      window.requestAnimationFrame(restore)
    }
  }

  window.requestAnimationFrame(restore)
}

export function OrderItemForm({
  item,
  vendorId,
  vendorSlug,
}: OrderItemFormProps) {
  const t = useTranslations("Order")
  const common = useTranslations("Common.actions")
  const format = useDashboardFormats()
  const formRef = useRef<HTMLFormElement>(null)
  const toastIdRef = useRef<string | number | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isScheduled, setIsScheduled] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pending, startTransition] = useTransition()
  const isBusy = pending || isScheduled || isSubmitting

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }

      if (toastIdRef.current !== null) {
        toast.dismiss(toastIdRef.current)
      }
    }
  }, [])

  async function submitOrder(formData: FormData, scrollY: number) {
    setIsSubmitting(true)

    try {
      await createOrderAction(formData)
      formRef.current?.reset()
      toast.success(t("feedback.createdTitle"), {
        description: t("feedback.createdDescription", { item: item.name }),
      })
      restoreScroll(scrollY)
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : t("errors.generic")
      setError(message)
      toast.error(t("feedback.failedTitle"), {
        description: message,
        duration: ORDER_UNDO_DELAY_MS,
      })
      restoreScroll(scrollY)
    } finally {
      setIsSubmitting(false)
    }
  }

  function clearScheduledOrder(showCancelledToast = true) {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    if (toastIdRef.current !== null) {
      toast.dismiss(toastIdRef.current)
      toastIdRef.current = null
    }

    setIsScheduled(false)

    if (showCancelledToast) {
      toast(t("feedback.cancelledTitle"), {
        description: t("feedback.cancelledDescription", { item: item.name }),
      })
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isBusy || !item.in_stock) return

    const formData = new FormData(event.currentTarget)
    const scrollY = window.scrollY
    setError(null)
    setIsScheduled(true)

    toastIdRef.current = toast.info(t("feedback.scheduledTitle"), {
      action: {
        label: common("undo"),
        onClick: () => clearScheduledOrder(),
      },
      description: t("feedback.scheduledDescription"),
      dismissible: false,
      duration: ORDER_UNDO_DELAY_MS + 500,
    })

    timeoutRef.current = window.setTimeout(() => {
      if (toastIdRef.current !== null) {
        toast.dismiss(toastIdRef.current)
        toastIdRef.current = null
      }

      timeoutRef.current = null
      setIsScheduled(false)

      startTransition(() => {
        void submitOrder(formData, scrollY)
      })
    }, ORDER_UNDO_DELAY_MS)
  }

  return (
    <Card size="sm">
      <form
        className="flex flex-col gap-(--card-spacing)"
        id={`order-form-${item.id}`}
        onSubmit={handleSubmit}
        ref={formRef}
      >
        <input name="vendorId" type="hidden" value={vendorId} />
        <input name="vendorSlug" type="hidden" value={vendorSlug} />
        <input name="menuItemId" type="hidden" value={item.id} />

        <CardHeader>
          <CardTitle>{item.name}</CardTitle>
          <CardDescription>
            {item.menu_categories?.name ?? t("menuFallback")} ·{" "}
            {format.currency(Number(item.price))}
          </CardDescription>
          <CardAction>
            <Badge variant={item.in_stock ? "secondary" : "outline"}>
              {item.in_stock ? t("inStock") : t("off")}
            </Badge>
          </CardAction>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          <FieldGroup className="grid grid-cols-[minmax(0,1fr)_5rem] gap-3">
            <Field>
              <FieldLabel htmlFor={`customer-${item.id}`}>
                {t("customer")}
              </FieldLabel>
              <Input
                defaultValue={t("counterDefault")}
                id={`customer-${item.id}`}
                name="customerLabel"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`quantity-${item.id}`}>
                {t("quantity")}
              </FieldLabel>
              <Input
                defaultValue="1"
                id={`quantity-${item.id}`}
                min="1"
                name="quantity"
                type="number"
              />
            </Field>
          </FieldGroup>
          {error ? <FieldError>{error}</FieldError> : null}
        </CardContent>

        <CardFooter>
          <Button
            className="w-full"
            disabled={!item.in_stock || isBusy}
            size="sm"
            type="submit"
          >
            <ReceiptText data-icon="inline-start" />
            {isScheduled
              ? t("undoAvailable")
              : isSubmitting || pending
                ? t("creating")
                : t("addOrder")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
