type InfoItemProps = {
    label: string;
    value?: string | number | null;
    className?: string;
};

export default function InfoItem({ label, value, className }: InfoItemProps) {
    return (
        <div className={`flex flex-col ${className || ''}`}>
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-sm font-medium wrap-break-word">
                {value ?? '-'}
            </span>
        </div>
    );
}
