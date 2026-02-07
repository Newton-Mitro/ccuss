import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // base
        "flex h-9 w-full min-w-0 rounded-md border bg-background px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow]",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground md:text-sm",

        // focus
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",

        // validation
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",

        // disabled (customized)
        "disabled:bg-muted disabled:border-muted-foreground/30",
        "disabled:text-muted-foreground disabled:placeholder:text-muted-foreground/70",
        "disabled:cursor-not-allowed",
        "disabled:select-text", // <-- text selectable
        // ⚠️ removed: disabled:pointer-events-none & disabled:opacity-40

        className
      )}
      {...props}
    />
  )
}

export { Input }
