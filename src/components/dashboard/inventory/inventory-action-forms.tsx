"use client"

import { PackageMinus, PackagePlus, Plus } from "lucide-react"
import { useActionState, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import {
  adjustStockItemAction,
  createStockItemAction,
  type InventoryMutationState,
} from "@/app/actions/workspace-operations"
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
} from "@/lib/inventory"
import type { StockItem } from "@/lib/supabase/types"

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
  const formRef = useRef<HTMLFormElement>(null)
  const [unit, setUnit] = useState("kg")
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
          <CardTitle>Add ingredient</CardTitle>
          <CardDescription>
            Create a stocked ingredient and its reorder threshold.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="ingredient-name">Ingredient</FieldLabel>
              <Input
                autoComplete="off"
                id="ingredient-name"
                maxLength={80}
                name="name"
                placeholder="Cooking oil"
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="ingredient-unit">Unit</FieldLabel>
              <Select onValueChange={setUnit} required value={unit}>
                <SelectTrigger className="w-full" id="ingredient-unit">
                  <SelectValue>
                    {stockUnitOptions.find((option) => option.value === unit)
                      ?.label ?? "Choose unit"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Measurement unit</SelectLabel>
                    {stockUnitOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <FieldGroup className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="ingredient-opening-quantity">
                  Opening quantity
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
                  Reorder at
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
            {pending ? "Adding ingredient" : "Add ingredient"}
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
          <CardTitle>Record movement</CardTitle>
          <CardDescription>
            Add a purchase or record ingredient usage and wastage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="movement-stock-item">Ingredient</FieldLabel>
              <Select name="stockItemId" required>
                <SelectTrigger className="w-full" id="movement-stock-item">
                  <SelectValue placeholder="Choose ingredient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Stock register</SelectLabel>
                    {stockItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} · {item.current_qty} {item.unit}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Movement</FieldLabel>
              <ToggleGroup
                aria-label="Stock movement type"
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
                    {option.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>

            <Field>
              <FieldLabel htmlFor="movement-quantity">Quantity</FieldLabel>
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
              <FieldLabel htmlFor="movement-reason">Reason</FieldLabel>
              <Input
                autoComplete="off"
                id="movement-reason"
                maxLength={120}
                name="reason"
                placeholder={
                  movementType === "in" ? "Supplier purchase" : "Kitchen usage"
                }
                required
              />
              <FieldDescription>
                Stock out cannot reduce the ingredient below zero.
              </FieldDescription>
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
            {pending ? "Recording movement" : "Record movement"}
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
