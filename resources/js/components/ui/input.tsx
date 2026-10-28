import * as React from "react"
import { cn } from "@/lib/utils"
import InputError from "../input-error"

interface InputProps extends React.ComponentProps<"input"> {
  error?: string
  showErrorText?: boolean
  wrapperClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      error,
      showErrorText = false,
      wrapperClassName,
      ...props
    },
    ref
  ) => {
    const isCheckable = type === "checkbox" || type === "radio"
    const isHidden =
      type === "hidden" ||
      (typeof className === "string" &&
        className.split(/\s+/).includes("hidden"))
    const input = (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        aria-invalid={!!error}
        className={cn(
          isCheckable
            ? "size-4 shrink-0 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            : [
              "flex h-9 w-full min-w-0 rounded-md border border-border",
                "bg-background text-foreground",
                "px-3 py-1 text-sm outline-none",
                "transition-[color,box-shadow,border-color,background-color]",
                "file:inline-flex file:h-7 file:border-0 file:bg-transparent",
                "file:text-sm file:font-medium file:text-foreground",
                "placeholder:text-muted-foreground",
                "selection:bg-primary selection:text-primary-foreground",
                "focus-visible:border-ring",
                "focus-visible:ring-2 focus-visible:ring-ring/40",
              ],
          error &&
            (isCheckable
              ? "focus-visible:ring-destructive/40"
              : "border-destructive text-destructive placeholder:text-destructive/70 focus-visible:ring-destructive/40"),
          "disabled:pointer-events-none disabled:bg-border disabled:cursor-not-allowed disabled:opacity-50 disabled:border-secondary",
          className
        )}
        {...props}
      />
    )

    if (isCheckable || isHidden) {
      return (
        <>
          {input}
          {error && showErrorText && <InputError message={error} />}
        </>
      )
    }

    return (
      <div className={cn("flex flex-col gap-1", wrapperClassName)}>
        {input}
        {error && showErrorText && <InputError message={error} />}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input }