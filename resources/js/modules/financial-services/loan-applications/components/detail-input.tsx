import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { DetailInputProps } from '@/modules/financial-services/types/loan-applications/components/detail-input.types';


export default function DetailInput({
    label,
    value,
    onChange,
    type = 'text',
    error,
    placeholder,
}: DetailInputProps) {
    return (
        <div className="min-w-0 space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
                {label}
            </Label>
            <Input
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={(event) => onChange(event.target.value)}
                className="h-9"
            />
            <InputError message={error} />
        </div>
    );
}
