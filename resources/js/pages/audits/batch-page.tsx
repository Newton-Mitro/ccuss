import { Head } from '@inertiajs/react';
import HeadingSmall from '../../components/heading-small';
import CustomAuthLayout from '../../layouts/custom-auth-layout';
import { formatDateTime } from '../../lib/date_util';
import { BreadcrumbItem } from '../../types';

type Change = {
    model: string;
    event: 'CREATED' | 'UPDATED' | 'DELETED';
    old: Record<string, any> | null;
    new: Record<string, any> | null;
};

interface BatchPageProps {
    batch: {
        batch_id: string;
        event_at: string;
        user?: { id: number; name: string };
        changes: Change[];
    };
}

export default function Batch({ batch }: BatchPageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Audit Logs', href: '/audits' },
        { title: `Batch ${batch.batch_id}`, href: '#' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Audit Batch ${batch.batch_id}`} />

            <div className="space-y-6 p-4 text-foreground">
                {/* Header */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <HeadingSmall
                        title={`Audit Batch ${batch.batch_id}`}
                        description={`Performed by ${batch.user?.name ?? 'System'} · ${formatDateTime(batch.event_at)}`}
                    />
                </div>

                {/* Changes */}
                <div className="space-y-4">
                    {batch.changes.map((c, idx) => (
                        <div
                            key={idx}
                            className="rounded-md border border-border bg-background p-4"
                        >
                            <div className="mb-2 text-sm font-medium">
                                {c.model} –{' '}
                                <span className="font-semibold">{c.event}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                {/* Old values */}
                                <div>
                                    <div className="mb-1 font-semibold text-muted-foreground">
                                        Old
                                    </div>
                                    <pre className="max-h-40 overflow-auto rounded-md border border-border bg-muted/20 p-2 text-xs">
                                        {JSON.stringify(c.old, null, 2)}
                                    </pre>
                                </div>

                                {/* New values */}
                                <div>
                                    <div className="mb-1 font-semibold text-muted-foreground">
                                        New
                                    </div>
                                    <pre className="max-h-40 overflow-auto rounded-md border border-border bg-muted/20 p-2 text-xs">
                                        {JSON.stringify(c.new, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </CustomAuthLayout>
    );
}
