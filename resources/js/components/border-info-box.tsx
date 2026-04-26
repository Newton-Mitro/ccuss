import formatUndersoreString from '../lib/formatUnderscoreString';

export function BorderInfoBox({
    label,
    value,
    className = 'bg-card',
}: {
    label: string;
    value: string;
    className?: string;
}) {
    return (
        <div
            className={`rounded-md border border-border p-3 ${className || ''}`}
        >
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-medium">
                {formatUndersoreString(value?.toString() || '—')}
            </p>
        </div>
    );
}
