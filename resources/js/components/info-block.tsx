import formatUndersoreString from '../lib/formatUnderscoreString';

export function InfoItem({
    label,
    value,
    className,
}: {
    label: string;
    value: string;
    className?: string;
}) {
    return (
        <div className={`rounded-md border bg-muted/30 p-3 ${className || ''}`}>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-medium">
                {formatUndersoreString(value || '—')}
            </p>
        </div>
    );
}
