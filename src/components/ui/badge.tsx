import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex min-h-5 w-fit shrink-0 items-center justify-center gap-1 rounded-4xl border border-transparent px-2 py-1 text-xs leading-[1.4] font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        paid:
          "border-status-paid/40 bg-status-paid/15 text-status-paid before:size-1.5 before:shrink-0 before:rounded-full before:bg-current focus-visible:ring-status-paid/25 dark:bg-status-paid/20 dark:focus-visible:ring-status-paid/35 [a]:hover:bg-status-paid/20",
        preparing:
          "border-status-preparing/40 bg-status-preparing/15 text-status-preparing before:size-1.5 before:shrink-0 before:rounded-full before:bg-current focus-visible:ring-status-preparing/25 dark:bg-status-preparing/20 dark:focus-visible:ring-status-preparing/35 [a]:hover:bg-status-preparing/20",
        ready:
          "border-status-ready/40 bg-status-ready/15 text-status-ready before:size-1.5 before:shrink-0 before:rounded-full before:bg-current focus-visible:ring-status-ready/25 dark:bg-status-ready/20 dark:focus-visible:ring-status-ready/35 [a]:hover:bg-status-ready/20",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
