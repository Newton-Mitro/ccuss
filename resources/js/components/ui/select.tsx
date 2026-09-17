import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
  className?: string;
  value?: string | number | null;
  onChange?: (value: any) => void;
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
  className = "bg-background",
  showErrorText = false,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [openUpward, setOpenUpward] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    bottom: 0,
  });

  const ref = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(
    (opt) => String(opt.value) === String(value ?? '')
  );

  const filteredOptions = options.filter((opt) =>
    opt?.label?.toLowerCase().includes(search?.toLowerCase())
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
      if (
        ref.current &&
        !ref.current.contains(event.target as Node) &&
        !dropdownRef.current?.contains(event.target as Node)
      ) {
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

      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        bottom: window.innerHeight - rect.top + 4,
      });
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
    <div className="relative  rounded-md w-full" ref={ref}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={cn(
          "w-full rounded-md border px-2 text-left  text-base shadow-sm-xs flex justify-between items-center transition-[color,box-shadow] outline-none h-8",
          error ? "border-destructive" : "border-border",
          "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-background disabled:opacity-50",
          className
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
      {open && !disabled && typeof document !== "undefined" &&
        createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: "fixed",
            top: openUpward ? "auto" : dropdownPosition.top,
            bottom: openUpward ? dropdownPosition.bottom : "auto",
            left: dropdownPosition.left,
            width: dropdownPosition.width,
          }}
          className="z-[100] rounded-md border border-border bg-card p-1 shadow-lg"
        >
          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full border border-input px-2 py-1 rounded-md text-sm bg-background/70 outline-none h-8"
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
        </div>,
        document.body,
      )}

      {/* Error */}
      {error && showErrorText && <InputError message={error} />}
    </div>
  );
};

export { Select };