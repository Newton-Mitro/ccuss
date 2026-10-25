import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';

type RepeatableSectionProps = {
    title: string;
    description?: string;
    count: number;
    addLabel: string;
    onAdd: () => void;
    children: ReactNode;
};

export default function RepeatableSection({
    title,
    description,
    count,
    addLabel,
    onAdd,
    children,
}: RepeatableSectionProps) {
    return (
        <section className="space-y-4 border-t pt-5 sm:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/40 text-sm font-semibold tabular-nums">
                        {String(count).padStart(2, '0')}
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
                        {description && (
                            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
                        )}
                    </div>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={onAdd}>
                    <Plus className="mr-1.5 size-4" />
                    {addLabel}
                </Button>
            </div>
            {children}
        </section>
    );
}
