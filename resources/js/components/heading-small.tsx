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
        <div
            data-slot="page-heading"
            className={cn('min-w-0 space-y-0.5', className)}
        >
            <h1 className="text-xl leading-tight font-semibold tracking-tight text-foreground">
                {title}
            </h1>
            {description && (
                <p className="text-xs leading-5 text-muted-foreground">
                    {description}
                </p>
            )}
        </div>
    );
}
