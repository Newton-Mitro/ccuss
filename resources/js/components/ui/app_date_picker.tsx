import React, { useRef } from 'react';
import { Label } from './label';
import { Input } from './input';
import { Calendar } from 'lucide-react';
import InputError from '../input-error';

interface AppDatePickerProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  small?: boolean;
}

const AppDatePicker: React.FC<AppDatePickerProps> = ({
  label,
  value,
  onChange,
  error,
  disabled = false,
  small = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const openDatePicker = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.showPicker?.(); // modern browsers only
      inputRef.current.focus();
    }
  };

  return (
    <div className="grid gap-2 relative">
      <Label>{label}</Label>
      <div className="relative">
        <Input
          type="date"
          value={value}
          ref={inputRef}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={`${small ? 'text-sm' : ''} pr-10 cursor-pointer`}
        />
        <Calendar
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 cursor-pointer"
          onClick={openDatePicker}
        />
      </div>
      {error && <InputError message={error} />}
    </div>
  );
};

export default AppDatePicker;
