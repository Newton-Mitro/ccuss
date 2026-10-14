import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';

type RepeatableRowProps = {
    index: number;
    title: string;
    children: ReactNode;
    onRemove: () => void;
    columns?: string;
};

export default function RepeatableRow({
    index,
    title,
    children,
    onRemove,
    columns = 'sm:grid-cols-3',
}: RepeatableRowProps) {
    return (
        <div className="rounded-xl border bg-background p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-muted-foreground">
                    {title} {index + 1}
                </p>
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    aria-label={`Remove ${title.toLowerCase()} ${index + 1}`}
                    onClick={onRemove}
                >
                    <Trash2 className="size-4" />
                </Button>
            </div>
            <div className={`grid gap-3 ${columns}`}>{children}</div>
        </div>
    );
}
