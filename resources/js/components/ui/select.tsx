import * as React from "react"
import { cn } from "@/lib/utils"
import InputError from "../input-error";

interface SelectProps extends React.ComponentProps<"select"> {
  options: { value: string; label: string }[]
  includeNone?: boolean // optional flag
  error?: string
  showErrorText?: boolean
}

const Select: React.FC<SelectProps> = ({ className, options,error, includeNone = true,showErrorText = false, ...props }) => {
  return (
    <>
    <select
      data-slot="select"
      aria-invalid={error ? true : false}
      className={cn(
        "border-input bg-background text-base shadow-xs transition-[color,box-shadow] outline-none",
        "flex h-8 w-full min-w-0 rounded-md border px-2 py-1 md:text-sm",
        // validation
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {includeNone && (
        <option key={9999} value={''} >
          --None--
        </option>
      )}
      {options.map((opt, i) => (
        <option key={`opt-${i}-${opt.value}-${opt.label}` } value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && showErrorText && <InputError message={error} />}</>
  )
}

export { Select }
