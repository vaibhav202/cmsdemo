"use client"

import { PackageMinus, PackagePlus, Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useActionState, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import {
  adjustStockItemAction,
  createStockItemAction,
  type InventoryMutationState,
} from "@/features/inventory/actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  stockMovementOptions,
  stockUnitOptions,
  type StockMovementType,
  type StockUnit,
} from "@/features/inventory/config"
import type { StockItem } from "@/lib/supabase/types"

import { useDashboardFormats } from "@/components/dashboard/shared/format"

const initialState: InventoryMutationState = { status: "idle" }

type InventoryFormProps = {
  stockItems: StockItem[]
  vendorId: string
  vendorSlug: string
}

function useInventoryFeedback(
  state: InventoryMutationState,
  formRef: React.RefObject<HTMLFormElement | null>
) {
  useEffect(() => {
    if (!state.savedAt || !state.message) return

    if (state.status === "success") {
      toast.success(state.message)
      formRef.current?.reset()
      return
    }

    if (state.status === "error") {
      toast.error(state.message)
    }
  }, [formRef, state.message, state.savedAt, state.status])
}

function MutationMessage({ state }: { state: InventoryMutationState }) {
  if (!state.message) return null

  return state.status === "error" ? (
    <FieldError>{state.message}</FieldError>
  ) : (
    <FieldDescription aria-live="polite">{state.message}</FieldDescription>
  )
}

function CreateIngredientForm({
  vendorId,
  vendorSlug,
}: Pick<InventoryFormProps, "vendorId" | "vendorSlug">) {
  const t = useTranslations("Inventory")
  const common = useTranslations("Common")
  const formRef = useRef<HTMLFormElement>(null)
  const [unit, setUnit] = useState<StockUnit>("kg")
  const [state, action, pending] = useActionState(
    createStockItemAction,
    initialState
  )
  useInventoryFeedback(state, formRef)

  return (
    <Card>
      <form
        action={action}
        className="flex h-full flex-col gap-(--card-spacing)"
        ref={formRef}
      >
        <input name="vendorId" type="hidden" value={vendorId} />
        <input name="vendorSlug" type="hidden" value={vendorSlug} />
        <input name="unit" type="hidden" value={unit} />

        <CardHeader>
          <CardTitle>{t("addTitle")}</CardTitle>
          <CardDescription>{t("addDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="ingredient-name">
                {t("ingredient")}
              </FieldLabel>
              <Input
                autoComplete="off"
                id="ingredient-name"
                maxLength={80}
                name="name"
                placeholder={t("ingredientPlaceholder")}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="ingredient-unit">{t("unit")}</FieldLabel>
              <Select
                onValueChange={(value) => setUnit(value as StockUnit)}
                required
                value={unit}
              >
                <SelectTrigger className="w-full" id="ingredient-unit">
                  <SelectValue>
                    {common(`units.${unit}`)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{t("measurementUnit")}</SelectLabel>
                    {stockUnitOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {common(`units.${option.value}`)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <FieldGroup className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="ingredient-opening-quantity">
                  {t("openingQuantity")}
                </FieldLabel>
                <Input
                  defaultValue="0"
                  id="ingredient-opening-quantity"
                  min="0"
                  name="openingQty"
                  required
                  step="any"
                  type="number"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="ingredient-reorder-level">
                  {t("reorderAt")}
                </FieldLabel>
                <Input
                  defaultValue="0"
                  id="ingredient-reorder-level"
                  min="0"
                  name="reorderLevel"
                  required
                  step="any"
                  type="number"
                />
              </Field>
            </FieldGroup>

            <MutationMessage state={state} />
          </FieldGroup>
        </CardContent>
        <CardFooter className="mt-auto">
          <Button className="w-full" disabled={pending} type="submit">
            <Plus data-icon="inline-start" />
            {pending ? t("adding") : t("add")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

function AdjustStockForm({
  stockItems,
  vendorId,
  vendorSlug,
}: InventoryFormProps) {
  const t = useTranslations("Inventory")
  const common = useTranslations("Common")
  const format = useDashboardFormats()
  const formRef = useRef<HTMLFormElement>(null)
  const [movementType, setMovementType] = useState<StockMovementType>("in")
  const [state, action, pending] = useActionState(
    adjustStockItemAction,
    initialState
  )
  useInventoryFeedback(state, formRef)

  return (
    <Card>
      <form
        action={action}
        className="flex h-full flex-col gap-(--card-spacing)"
        ref={formRef}
      >
        <input name="vendorId" type="hidden" value={vendorId} />
        <input name="vendorSlug" type="hidden" value={vendorSlug} />
        <input name="movementType" type="hidden" value={movementType} />

        <CardHeader>
          <CardTitle>{t("movementTitle")}</CardTitle>
          <CardDescription>{t("movementDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="movement-stock-item">
                {t("ingredient")}
              </FieldLabel>
              <Select name="stockItemId" required>
                <SelectTrigger className="w-full" id="movement-stock-item">
                  <SelectValue placeholder={t("chooseIngredient")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{t("stockRegisterGroup")}</SelectLabel>
                    {stockItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} · {format.quantity(Number(item.current_qty))}{" "}
                        {item.unit}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>{t("movement")}</FieldLabel>
              <ToggleGroup
                aria-label={t("movementAria")}
                className="grid w-full grid-cols-2"
                onValueChange={(value) => {
                  if (value === "in" || value === "out") {
                    setMovementType(value)
                  }
                }}
                spacing={0}
                type="single"
                value={movementType}
                variant="outline"
              >
                {stockMovementOptions.map((option) => (
                  <ToggleGroupItem
                    className="w-full"
                    key={option.value}
                    value={option.value}
                  >
                    {option.value === "in" ? <PackagePlus /> : <PackageMinus />}
                    {common(`stockMovement.${option.value}`)}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>

            <Field>
              <FieldLabel htmlFor="movement-quantity">
                {t("quantity")}
              </FieldLabel>
              <Input
                id="movement-quantity"
                min="0.001"
                name="quantity"
                placeholder="0"
                required
                step="any"
                type="number"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="movement-reason">{t("reason")}</FieldLabel>
              <Input
                autoComplete="off"
                id="movement-reason"
                maxLength={120}
                name="reason"
                placeholder={
                  movementType === "in"
                    ? t("purchasePlaceholder")
                    : t("usagePlaceholder")
                }
                required
              />
              <FieldDescription>{t("movementRule")}</FieldDescription>
            </Field>

            <MutationMessage state={state} />
          </FieldGroup>
        </CardContent>
        <CardFooter className="mt-auto">
          <Button
            className="w-full"
            disabled={pending || stockItems.length === 0}
            type="submit"
          >
            {movementType === "in" ? (
              <PackagePlus data-icon="inline-start" />
            ) : (
              <PackageMinus data-icon="inline-start" />
            )}
            {pending ? t("recording") : t("record")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export function InventoryActionForms(props: InventoryFormProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <CreateIngredientForm
        vendorId={props.vendorId}
        vendorSlug={props.vendorSlug}
      />
      <AdjustStockForm {...props} />
    </div>
  )
}
