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
        <div className={cn('space-y-1', className)}>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {title}
            </h1>
            {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
            )}
        </div>
    );
}
