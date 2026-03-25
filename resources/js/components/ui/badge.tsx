import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  [
    "inline-flex items-center justify-center",
    "rounded-md border px-2 py-0.5",
    "text-xs font-medium whitespace-nowrap",
    "w-fit shrink-0 gap-1",
    "[&>svg]:size-3 [&>svg]:pointer-events-none",

    // base theme alignment
    "transition-[color,box-shadow,background-color,border-color]",
    "focus-visible:outline-none focus-visible:border-ring",
    "focus-visible:ring-2 focus-visible:ring-ring/40",

    // accessibility
    "aria-invalid:border-destructive aria-invalid:ring-destructive/40"
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/90",

        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/90",

        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/40",

        outline:
          "border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }