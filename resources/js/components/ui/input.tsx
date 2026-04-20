import * as React from "react"
import { cn } from "@/lib/utils"
import InputError from "../input-error"

interface InputProps extends React.ComponentProps<"input"> {
  error?: string
  showErrorText?: boolean
}

function Input({
  className,
  type,
  error,
  showErrorText = false,
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      <input
        type={type}
        data-slot="input"
        aria-invalid={!!error}
        className={cn(
          // base (fully theme-driven)
          "flex h-8 w-full min-w-0 rounded-md border border-border",
          "bg-background text-foreground",
          "px-3 py-1 text-sm  outline-none",
          "transition-[color,box-shadow,border-color,background-color]",

          // file input
          "file:inline-flex file:h-7 file:border-0 file:bg-transparent",
          "file:text-sm file:font-medium file:text-foreground",

          // placeholder & selection
          "placeholder:text-muted-foreground",
          "selection:bg-primary selection:text-primary-foreground",

          // focus (theme ring)
          "focus-visible:border-ring",
          "focus-visible:ring-2 focus-visible:ring-ring/40",

          // error state (overrides everything)
          error &&
            "border-destructive text-destructive placeholder:text-destructive/70 focus-visible:ring-destructive/40",

          // disabled
          "disabled:pointer-events-none disabled:bg-border disabled:cursor-not-allowed disabled:opacity-50",

          className
        )}
        {...props}
      />

      {error && showErrorText && <InputError message={error} />}
    </div>
  )
}

export { Input }