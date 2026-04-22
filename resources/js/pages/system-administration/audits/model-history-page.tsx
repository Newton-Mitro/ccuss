import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { formatDateTime } from '../../../lib/date_util';
import { BreadcrumbItem, SharedData } from '../../../types';
import { AuditBatch } from '../../../types/audit_models';

interface ModelHistoryProps extends SharedData {
    auditableType: string;
    auditableId: number;
    batches: AuditBatch[];
}

export default function ModelHistory({
    auditableType,
    auditableId,
    batches,
}: ModelHistoryProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'System Administration', href: '' },
        { title: 'Audit Logs', href: route('audits.index') },
        { title: `${auditableType} #${auditableId}`, href: '#' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`${auditableType} #${auditableId} – Audit History`} />

            <div className="space-y-6 text-foreground">
                {/* Header */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <HeadingSmall
                        title={`${auditableType} #${auditableId} – Audit History`}
                        description={`All recorded batches for this entity`}
                    />
                </div>

                {/* Batches */}
                <div className="space-y-4">
                    {batches.length > 0 ? (
                        batches.map((batch) => (
                            <div
                                key={batch.batch_id}
                                className="rounded-md border bg-background p-4"
                            >
                                <div className="mb-2 flex items-center justify-between">
                                    <div className="text-sm">
                                        <div className="font-medium">
                                            {batch.user?.name ?? '-'}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {formatDateTime(batch.event_at)}
                                        </div>
                                    </div>

                                    <Link
                                        href={route(
                                            'audits.batch',
                                            batch.batch_id,
                                        )}
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        View details →
                                    </Link>
                                </div>

                                <ul className="ml-5 list-disc space-y-1 text-sm">
                                    {batch.changes.map((c, idx) => (
                                        <li key={idx}>
                                            <span className="font-medium">
                                                {c.model}
                                            </span>{' '}
                                            <span className="text-muted-foreground">
                                                {c.event}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))
                    ) : (
                        <div className="rounded-md border bg-background p-4 text-center text-muted-foreground">
                            No audit history found for this entity.
                        </div>
                    )}
                </div>
            </div>
        </CustomAuthLayout>
    );
}
