import React, { useRef, forwardRef } from 'react';
import { Label } from './label';
import { Input } from './input';
import { Calendar } from 'lucide-react';
import InputError from '../input-error';

interface AppDatePickerProps {
  label?: string;
  value: string;
  onChange?: (value: string) => void;
  error?: string;
  showErrorText?: boolean
  disabled?: boolean;
}

const AppDatePicker = forwardRef<HTMLInputElement, AppDatePickerProps>(
  ({ label, value, onChange, error, disabled = false, showErrorText=false }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const combinedRef = (node: HTMLInputElement) => {
      inputRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
    };

    const openDatePicker = () => {
      if (!disabled && inputRef.current) {
        inputRef.current.showPicker?.();
        inputRef.current.focus();
      }
    };

    return (
      <div className="relative">
        {label && <Label className="text-xs">{label}</Label>}
        <div className="relative">
          <Input
            aria-invalid={error ? true : false}
            type="date"
            value={value}
            ref={combinedRef}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            className="h-8 text-sm pr-8 cursor-pointer" // match Input size
          />
          <Calendar
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 cursor-pointer"
            onClick={openDatePicker}
          />
        </div>
        {error && showErrorText && <InputError message={error} />}
      </div>
    );
  }
);

AppDatePicker.displayName = 'AppDatePicker';

export default AppDatePicker;
