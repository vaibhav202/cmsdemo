"use client"

import { ReceiptText } from "lucide-react"
import {
  type FormEvent,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react"
import { toast } from "sonner"

import { createOrderAction } from "@/app/actions/workspace-operations"
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

import { formatCurrency } from "../shared/format"

type OrderItemFormProps = {
  item: MenuItemWithCategory
  vendorId: string
  vendorSlug: string
}

const ORDER_UNDO_DELAY_MS = 10_000

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return "Unable to create order."
}

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
      toast.success("Order sent to queue", {
        description: `${item.name} was created after the undo window.`,
      })
      restoreScroll(scrollY)
    } catch (submitError) {
      const message = getErrorMessage(submitError)
      setError(message)
      toast.error("Order could not be created", {
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
      toast("Order cancelled", {
        description: `${item.name} was not sent to the queue.`,
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

    toastIdRef.current = toast.info("Order will be created in 10 seconds", {
      action: {
        label: "Undo",
        onClick: () => clearScheduledOrder(),
      },
      description: "Undo now if this counter order was tapped by mistake.",
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
            {item.menu_categories?.name ?? "Menu"} ·{" "}
            {formatCurrency(Number(item.price))}
          </CardDescription>
          <CardAction>
            <Badge variant={item.in_stock ? "secondary" : "outline"}>
              {item.in_stock ? "In stock" : "Off"}
            </Badge>
          </CardAction>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          <FieldGroup className="grid grid-cols-[minmax(0,1fr)_5rem] gap-3">
            <Field>
              <FieldLabel htmlFor={`customer-${item.id}`}>Customer</FieldLabel>
              <Input
                defaultValue="Counter"
                id={`customer-${item.id}`}
                name="customerLabel"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`quantity-${item.id}`}>Qty</FieldLabel>
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
              ? "Undo available"
              : isSubmitting || pending
                ? "Creating"
                : "Add order"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
