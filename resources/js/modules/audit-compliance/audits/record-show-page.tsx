import {
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarClock,
    CircleHelp,
    FileCheck2,
    Link2,
    Pencil,
    UserRound,
} from 'lucide-react';
import { route } from 'ziggy-js';
import type { Props } from '@/modules/audit-compliance/types/audits/record-show-page.interfaces';


function statusTone(status: string) {
    if (['APPROVED', 'COMPLIANT', 'ACCEPTED', 'COMPLETED'].includes(status)) {
        return 'success';
    }
    if (['REJECTED', 'NON_COMPLIANT', 'CLOSED'].includes(status)) {
        return 'danger';
    }
    if (
        ['IN_PROGRESS', 'UNDER_REVIEW', 'SUBMITTED', 'MITIGATING'].includes(
            status,
        )
    ) {
        return 'warning';
    }
    return 'neutral';
}

function prettyDate(date: string | null) {
    if (!date) return 'Not set';
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
    }).format(new Date(`${date.slice(0, 10)}T00:00:00`));
}

export default function RecordShowPage({
    register,
    record,
    approvalLogs,
}: Props) {
    const { auth } = usePage<Props>().props;
    const canUpdate =
        auth.user.permissions?.some(
            ({ slug }) => slug === `${register.permission}.update`,
        ) ?? false;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Audit & Compliance', href: '' },
        { title: register.area, href: '' },
        { title: register.title, href: route(`${register.route}.index`) },
        { title: record.reference, href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`${record.reference} · ${record.title}`} />

            <div className="mx-auto w-full max-w-6xl space-y-6 pb-8 text-foreground">
                <ResourcePageHeader
                    title={record.title}
                    description={`${register.singular} · ${record.reference}`}
                    action={
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" asChild>
                                <Link href={route(`${register.route}.index`)}>
                                    <ArrowLeft className="mr-2 size-4" />
                                    Back to register
                                </Link>
                            </Button>
                            {canUpdate && (
                                <Button asChild>
                                    <Link
                                        href={route(
                                            `${register.route}.edit`,
                                            record.id,
                                        )}
                                    >
                                        <Pencil className="mr-2 size-4" />
                                        Edit record
                                    </Link>
                                </Button>
                            )}
                        </div>
                    }
                    className="rounded-2xl border border-border bg-linear-to-r from-primary/10 via-card to-card p-5 shadow-sm sm:p-6"
                />

                <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="space-y-5">
                        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/20 px-5 py-4 sm:px-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <FileCheck2 className="size-5" />
                                    </div>
                                    <div>
                                        <p className="font-mono text-xs text-muted-foreground">
                                            {record.reference}
                                        </p>
                                        <h2 className="mt-1 text-sm font-semibold">
                                            Record overview
                                        </h2>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <StatusBadge
                                        tone={statusTone(record.status)}
                                    >
                                        {record.status.replaceAll('_', ' ')}
                                    </StatusBadge>
                                    <StatusBadge
                                        tone={
                                            record.priority === 'CRITICAL' ||
                                            record.priority === 'HIGH'
                                                ? 'danger'
                                                : record.priority === 'MEDIUM'
                                                  ? 'warning'
                                                  : 'neutral'
                                        }
                                    >
                                        {record.priority} priority
                                    </StatusBadge>
                                </div>
                            </div>

                            <dl className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
                                {[
                                    {
                                        label: 'Category / regulator',
                                        value:
                                            record.category || 'Not specified',
                                    },
                                    {
                                        label: 'Responsible person',
                                        value:
                                            record.responsible_person ||
                                            'Unassigned',
                                    },
                                    {
                                        label: 'Due date',
                                        value: prettyDate(record.due_date),
                                    },
                                    {
                                        label: 'Last updated',
                                        value: prettyDate(record.updated_at),
                                    },
                                ].map(({ label, value }) => (
                                    <div
                                        key={label}
                                        className="rounded-xl border border-border/70 bg-background/70 px-4 py-3.5"
                                    >
                                        <dt className="text-xs font-medium text-muted-foreground">
                                            {label}
                                        </dt>
                                        <dd className="mt-1.5 text-sm font-semibold">
                                            {value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </section>

                        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                            <div className="flex items-center gap-3 border-b border-border px-5 py-4 sm:px-6">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <CircleHelp className="size-4" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold">
                                        Description and notes
                                    </h2>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        Context and supporting details
                                    </p>
                                </div>
                            </div>
                            <div className="p-5 sm:p-6">
                                {record.description ? (
                                    <p className="text-sm leading-7 whitespace-pre-wrap text-muted-foreground">
                                        {record.description}
                                    </p>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        No description has been recorded.
                                    </p>
                                )}
                            </div>
                        </section>

                        {approvalLogs.length > 0 && (
                            <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                                <div className="flex items-center gap-3 border-b border-border px-5 py-4 sm:px-6">
                                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <CalendarClock className="size-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold">
                                            Decision history
                                        </h2>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            Immutable approval and submission
                                            decisions.
                                        </p>
                                    </div>
                                </div>
                                <div className="divide-y divide-border/70">
                                    {approvalLogs.map((log) => (
                                        <div
                                            key={log.id}
                                            className="space-y-2 px-5 py-4 sm:px-6"
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <StatusBadge
                                                        tone={statusTone(
                                                            log.action,
                                                        )}
                                                    >
                                                        {log.action}
                                                    </StatusBadge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {log.previous_status ??
                                                            'NEW'}{' '}
                                                        → {log.new_status}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Intl.DateTimeFormat(
                                                        undefined,
                                                        {
                                                            dateStyle: 'medium',
                                                            timeStyle: 'short',
                                                        },
                                                    ).format(
                                                        new Date(log.acted_at),
                                                    )}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {log.actor?.name ??
                                                    'System user'}
                                            </p>
                                            {log.comment && (
                                                <p className="text-sm leading-relaxed">
                                                    {log.comment}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    <aside className="space-y-4 lg:sticky lg:top-4">
                        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                            <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <UserRound className="size-4" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold">
                                        Ownership
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        Record responsibility
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-3 p-4">
                                <div className="rounded-xl border border-border/70 bg-background/70 p-3.5">
                                    <p className="text-xs text-muted-foreground">
                                        Responsible person
                                    </p>
                                    <p className="mt-1 text-sm font-semibold">
                                        {record.responsible_person ||
                                            'Unassigned'}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-border/70 bg-background/70 p-3.5">
                                    <p className="text-xs text-muted-foreground">
                                        Created
                                    </p>
                                    <p className="mt-1 text-sm font-semibold">
                                        {prettyDate(record.created_at)}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {record.related_record && (
                            <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                                <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
                                    <Link2 className="size-4 text-primary" />
                                    <div>
                                        <h2 className="text-sm font-semibold">
                                            Related record
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                            Linked item
                                        </p>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <p className="font-mono text-xs text-muted-foreground">
                                        {record.related_record.reference}
                                    </p>
                                    <p className="mt-1 text-sm font-semibold">
                                        {record.related_record.title}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {record.related_record.kind.replaceAll(
                                            '_',
                                            ' ',
                                        )}
                                    </p>
                                </div>
                            </section>
                        )}
                    </aside>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
