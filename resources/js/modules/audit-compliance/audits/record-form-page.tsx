import InputError from '@/components/input-error';
import { ResourcePageHeader } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    CircleHelp,
    FileCheck2,
    LoaderCircle,
    UserRound,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { route } from 'ziggy-js';
import type { Props } from '@/modules/audit-compliance/types/audits/record-form-page.interfaces';


function formatKind(kind: string) {
    return kind
        .toLowerCase()
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

export default function RecordFormPage({
    register,
    record,
    relatedRecords,
    statuses,
    priorities,
}: Props) {
    const editing = Boolean(record);
    const { data, setData, post, put, processing, errors } = useForm({
        reference: record?.reference ?? '',
        title: record?.title ?? '',
        category: record?.category ?? '',
        description: record?.description ?? '',
        status: record?.status ?? 'OPEN',
        priority: record?.priority ?? 'MEDIUM',
        responsible_person: record?.responsible_person ?? '',
        due_date: record?.due_date ?? '',
        related_record_id: record?.related_record_id
            ? String(record.related_record_id)
            : '',
        _decision_comment: '',
    });
    useFlashToastHandler();

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (record) {
            put(route(`${register.route}.update`, record.id), {
                preserveScroll: true,
            });
        } else {
            post(route(`${register.route}.store`), { preserveScroll: true });
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Audit & Compliance', href: '' },
        { title: register.area, href: '' },
        { title: register.title, href: route(`${register.route}.index`) },
        { title: editing ? 'Edit Record' : 'New Record', href: '' },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`${editing ? 'Edit' : 'New'} ${register.singular}`} />

            <div className="mx-auto w-full max-w-6xl space-y-6 pb-8 text-foreground">
                <ResourcePageHeader
                    title={`${editing ? 'Edit' : 'New'} ${register.singular}`}
                    description={register.description}
                    action={
                        <Button variant="outline" asChild>
                            <Link href={route(`${register.route}.index`)}>
                                <ArrowLeft className="mr-2 size-4" />
                                Back to {register.title.toLowerCase()}
                            </Link>
                        </Button>
                    }
                    className="rounded-2xl border border-border bg-linear-to-r from-primary/10 via-card to-card p-5 shadow-sm sm:p-6"
                />

                <form
                    onSubmit={submit}
                    className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]"
                >
                    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                        <div className="flex items-center gap-3 border-b border-border bg-muted/20 px-5 py-4 sm:px-6">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <FileCheck2 className="size-5" />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold">
                                    Record details
                                </h2>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Add the information needed to manage this
                                    item through its lifecycle.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6 p-5 sm:p-6">
                            <section className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-semibold">
                                        Identification
                                    </h3>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Leave the reference blank to generate
                                        one automatically.
                                    </p>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="record-reference">
                                            Reference
                                        </Label>
                                        <Input
                                            id="record-reference"
                                            value={data.reference}
                                            onChange={(event) =>
                                                setData(
                                                    'reference',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Auto-generated if empty"
                                            className="h-10 font-mono"
                                            maxLength={80}
                                            aria-invalid={Boolean(
                                                errors.reference,
                                            )}
                                        />
                                        <InputError
                                            message={errors.reference}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="record-category">
                                            Category / regulator
                                        </Label>
                                        <Input
                                            id="record-category"
                                            value={data.category}
                                            onChange={(event) =>
                                                setData(
                                                    'category',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="e.g. Operational risk"
                                            className="h-10"
                                            maxLength={120}
                                            aria-invalid={Boolean(
                                                errors.category,
                                            )}
                                        />
                                        <InputError message={errors.category} />
                                    </div>
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <Label htmlFor="record-title">
                                            Title
                                        </Label>
                                        <Input
                                            id="record-title"
                                            value={data.title}
                                            onChange={(event) =>
                                                setData(
                                                    'title',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder={`Enter a ${register.singular.toLowerCase()} title`}
                                            className="h-10"
                                            required
                                            maxLength={255}
                                            aria-invalid={Boolean(errors.title)}
                                        />
                                        <InputError message={errors.title} />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4 border-t border-border pt-5">
                                <div>
                                    <h3 className="text-sm font-semibold">
                                        Ownership and progress
                                    </h3>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Set an owner, target date, and current
                                        lifecycle status.
                                    </p>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="record-status">
                                            Status
                                        </Label>
                                        <Select
                                            id="record-status"
                                            className="h-10 w-full"
                                            value={data.status}
                                            onChange={(value) =>
                                                setData('status', value)
                                            }
                                            options={statuses.map((status) => ({
                                                value: status,
                                                label: status.replaceAll(
                                                    '_',
                                                    ' ',
                                                ),
                                            }))}
                                        />
                                        <InputError message={errors.status} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="record-priority">
                                            Priority
                                        </Label>
                                        <Select
                                            id="record-priority"
                                            className="h-10 w-full"
                                            value={data.priority}
                                            onChange={(value) =>
                                                setData('priority', value)
                                            }
                                            options={priorities.map(
                                                (priority) => ({
                                                    value: priority,
                                                    label: priority,
                                                }),
                                            )}
                                        />
                                        <InputError message={errors.priority} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label
                                            htmlFor="record-responsible-person"
                                            className="flex items-center gap-2"
                                        >
                                            <UserRound className="size-3.5 text-muted-foreground" />
                                            Responsible person
                                        </Label>
                                        <Input
                                            id="record-responsible-person"
                                            value={data.responsible_person}
                                            onChange={(event) =>
                                                setData(
                                                    'responsible_person',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Person or team"
                                            className="h-10"
                                            maxLength={160}
                                            aria-invalid={Boolean(
                                                errors.responsible_person,
                                            )}
                                        />
                                        <InputError
                                            message={errors.responsible_person}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="record-due-date">
                                            Due date
                                        </Label>
                                        <Input
                                            id="record-due-date"
                                            type="date"
                                            value={data.due_date}
                                            onChange={(event) =>
                                                setData(
                                                    'due_date',
                                                    event.target.value,
                                                )
                                            }
                                            className="h-10"
                                            aria-invalid={Boolean(
                                                errors.due_date,
                                            )}
                                        />
                                        <InputError message={errors.due_date} />
                                    </div>
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <Label htmlFor="record-related">
                                            Related record
                                        </Label>
                                        <Select
                                            id="record-related"
                                            className="h-10 w-full"
                                            value={data.related_record_id}
                                            onChange={(value) =>
                                                setData(
                                                    'related_record_id',
                                                    value,
                                                )
                                            }
                                            options={[
                                                {
                                                    value: '',
                                                    label: 'No related record',
                                                },
                                                ...relatedRecords.map(
                                                    (related) => ({
                                                        value: String(
                                                            related.id,
                                                        ),
                                                        label: `${formatKind(related.kind)} · ${related.reference} — ${related.title}`,
                                                    }),
                                                ),
                                            ]}
                                        />
                                        <InputError
                                            message={errors.related_record_id}
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4 border-t border-border pt-5">
                                <div>
                                    <h3 className="text-sm font-semibold">
                                        Description and evidence notes
                                    </h3>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Capture context, observations, and
                                        supporting details.
                                    </p>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="record-description">
                                        Description
                                    </Label>
                                    <textarea
                                        id="record-description"
                                        value={data.description}
                                        onChange={(event) =>
                                            setData(
                                                'description',
                                                event.target.value,
                                            )
                                        }
                                        rows={6}
                                        maxLength={10000}
                                        placeholder="Add scope, observations, evidence, requirements, or actions..."
                                        className="flex min-h-36 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                                        aria-invalid={Boolean(
                                            errors.description,
                                        )}
                                    />
                                    <div className="flex items-center justify-between gap-3">
                                        <InputError
                                            message={errors.description}
                                        />
                                        <span className="ml-auto text-xs text-muted-foreground">
                                            {data.description.length}/10,000
                                        </span>
                                    </div>
                                </div>
                            </section>

                            {editing && (
                                <section className="space-y-4 border-t border-border pt-5">
                                    <div>
                                        <h3 className="text-sm font-semibold">
                                            Decision record
                                        </h3>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            A note is retained in the approval
                                            history when the status moves to
                                            approved, rejected, submitted, or
                                            accepted.
                                        </p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="decision-comment">
                                            Decision note
                                        </Label>
                                        <textarea
                                            id="decision-comment"
                                            value={data._decision_comment}
                                            onChange={(event) =>
                                                setData(
                                                    '_decision_comment',
                                                    event.target.value,
                                                )
                                            }
                                            rows={3}
                                            maxLength={2000}
                                            placeholder="Optional rationale or decision context"
                                            className="flex min-h-20 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                                            aria-invalid={Boolean(
                                                errors._decision_comment,
                                            )}
                                        />
                                        <InputError
                                            message={errors._decision_comment}
                                        />
                                    </div>
                                </section>
                            )}

                            <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
                                <Button type="button" variant="outline" asChild>
                                    <Link
                                        href={route(`${register.route}.index`)}
                                    >
                                        Cancel
                                    </Link>
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="gap-2"
                                >
                                    {processing ? (
                                        <LoaderCircle className="size-4 animate-spin" />
                                    ) : (
                                        <Check className="size-4" />
                                    )}
                                    {processing
                                        ? 'Saving...'
                                        : editing
                                          ? 'Save changes'
                                          : `Create ${register.singular.toLowerCase()}`}
                                </Button>
                            </div>
                        </div>
                    </section>

                    <aside className="space-y-4 lg:sticky lg:top-4">
                        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                            <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <FileCheck2 className="size-4" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold">
                                        Live preview
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        {register.singular}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-3 p-4">
                                <div className="rounded-xl border border-primary/15 bg-primary/5 p-3.5">
                                    <p className="font-mono text-xs font-semibold text-primary">
                                        {data.reference || 'AUTO REFERENCE'}
                                    </p>
                                    <p className="mt-1.5 text-sm font-semibold">
                                        {data.title || 'Record title'}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {data.category || register.area}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="rounded-xl border border-border/70 bg-background/70 p-3">
                                        <p className="text-xs text-muted-foreground">
                                            Status
                                        </p>
                                        <p className="mt-1 text-xs font-semibold">
                                            {data.status.replaceAll('_', ' ')}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-border/70 bg-background/70 p-3">
                                        <p className="text-xs text-muted-foreground">
                                            Priority
                                        </p>
                                        <p className="mt-1 text-xs font-semibold">
                                            {data.priority}
                                        </p>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-border/70 bg-background/70 p-3">
                                    <p className="text-xs text-muted-foreground">
                                        Responsible
                                    </p>
                                    <p className="mt-1 text-sm font-medium">
                                        {data.responsible_person ||
                                            'Unassigned'}
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-border bg-muted/20 p-4">
                            <div className="flex items-start gap-2.5">
                                <CircleHelp className="mt-0.5 size-4 shrink-0 text-primary" />
                                <div>
                                    <h3 className="text-xs font-semibold">
                                        Workflow information
                                    </h3>
                                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                        Status decisions are captured in
                                        approval history. Changes to this record
                                        are also retained in the activity audit
                                        log.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </aside>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
