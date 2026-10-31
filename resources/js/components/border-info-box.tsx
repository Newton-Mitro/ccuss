export function BorderInfoBox({
    label,
    value,
    className = 'bg-card',
}: {
    label: any;
    value: any;
    className?: string;
}) {
    return (
        <div
            className={`rounded-md border border-border p-3 ${className || ''}`}
        >
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="min-w-0 text-sm font-medium break-words">
                {value || '—'}
            </p>
        </div>
    );
}
