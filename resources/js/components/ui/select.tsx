import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import InputError from "../input-error";

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectSearchProps {
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  showErrorText?: boolean;
  disabled?: boolean;
}

const Select: React.FC<SelectSearchProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  error,
  showErrorText = false,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [openUpward, setOpenUpward] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (opt: Option) => {
    if (opt.disabled || disabled) return;

    onChange?.(opt.value);
    setOpen(false);
    setSearch("");
  };

  // 👉 Detect click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 👉 Detect dropdown position (flip logic)
  useEffect(() => {
    if (!open || !ref.current) return;

    const calculatePosition = () => {
      const rect = ref.current!.getBoundingClientRect();

      const dropdownHeight =
        dropdownRef.current?.offsetHeight || 200;

      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    };

    calculatePosition();

    window.addEventListener("scroll", calculatePosition, true);
    window.addEventListener("resize", calculatePosition);

    return () => {
      window.removeEventListener("scroll", calculatePosition, true);
      window.removeEventListener("resize", calculatePosition);
    };
  }, [open]);

  return (
    <div className="relative w-full" ref={ref}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={cn(
          "w-full rounded-md border px-2 text-left text-sm bg-background text-base shadow-sm-xs flex justify-between items-center transition-[color,box-shadow] outline-none h-8",
          error ? "border-destructive" : "border-input",
          "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            open ? "rotate-180" : "rotate-0"
          )}
        />
      </button>

      {/* Dropdown */}
      {open && !disabled && (
        <div
          ref={dropdownRef}
          className={cn(
            "absolute z-50 w-full rounded-md border border-input bg-background shadow-sm-xs",
            openUpward ? "bottom-full mb-1" : "top-full mt-1"
          )}
        >
          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full border-b border-input px-2 py-1 text-sm bg-background outline-none h-8"
          />

          {/* Options */}
          <ul className="max-h-40 overflow-y-auto">
            {filteredOptions.map((opt) => (
              <li
                key={opt.value}
                onClick={() => handleSelect(opt)}
                className={cn(
                  "px-2 py-1 text-sm transition-colors",
                  opt.disabled
                    ? "text-muted-foreground cursor-not-allowed"
                    : "cursor-pointer hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {opt.label}
              </li>
            ))}

            {filteredOptions.length === 0 && (
              <li className="px-2 py-1 text-sm text-muted-foreground">
                No results
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Error */}
      {error && showErrorText && <InputError message={error} />}
    </div>
  );
};

export { Select };