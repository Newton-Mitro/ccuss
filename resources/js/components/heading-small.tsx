import { cn } from '@/lib/utils';

export default function HeadingSmall({
    title,
    description,
    className,
}: {
    title: string;
    description?: string;
    className?: string;
}) {
    return (
        <header className={cn('space-y-1', className)}>
            <p className="text-[10px] font-semibold tracking-[0.18em] text-primary/80 uppercase">
                Resource
            </p>
            <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                {title}
            </h3>
            {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
            )}
        </header>
    );
}
