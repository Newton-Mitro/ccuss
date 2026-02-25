import * as React from "react"
import { cn } from "@/lib/utils"
import InputError from "../input-error"

interface InputProps extends React.ComponentProps<"input"> {
  error?: string
  showErrorText?: boolean
}

function Input({ className, type, error,showErrorText = false, ...props }: InputProps) {
  return (
    <div className="flex flex-col">
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
          error ? "border-destructive focus-visible:ring-destructive/50" : "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",

          // disabled
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",

          className
        )}
        {...props}
      />

      {error && showErrorText && <InputError message={error} />}
    </div>
  )
}

export { Input }