"use client"

import { FieldLegend, FieldSet } from "@/components/ui/field"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { vendorAccentOptions } from "@/lib/brand"
import { cn } from "@/lib/utils"

type VendorAccentOption = (typeof vendorAccentOptions)[number]

type VendorAccentToggleFieldProps = {
  onValueChange: (value: string) => void
  options: readonly VendorAccentOption[]
  value: string
}

export function VendorAccentToggleField({
  onValueChange,
  options,
  value,
}: VendorAccentToggleFieldProps) {
  return (
    <FieldSet>
      <FieldLegend>Accent color</FieldLegend>
      <input name="brandColorPreset" type="hidden" value={value} />
      <ToggleGroup
        className="grid w-full grid-cols-2 sm:grid-cols-3"
        onValueChange={(nextValue) => {
          if (nextValue) {
            onValueChange(nextValue)
          }
        }}
        type="single"
        value={value}
        variant="outline"
      >
        {options.map((option) => (
          <ToggleGroupItem
            className="justify-start"
            key={option.value}
            value={option.value}
          >
            <span
              aria-hidden="true"
              className={cn("size-4 rounded-full border", option.swatchClass)}
            />
            {option.name}
          </ToggleGroupItem>
        ))}
        <ToggleGroupItem className="justify-start" value="custom">
          Custom
        </ToggleGroupItem>
      </ToggleGroup>
    </FieldSet>
  )
}
