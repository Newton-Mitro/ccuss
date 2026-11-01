import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { Props } from '@/modules/general-accounting/types/cost-centers/form.interfaces';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    CircleHelp,
    FolderTree,
    Layers3,
    LoaderCircle,
    MapPin,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { route } from 'ziggy-js';

export default function CostCenterForm({ costCenter, parents = [] }: Props) {
    const editing = Boolean(costCenter);

    const { data, setData, post, put, processing, errors } = useForm({
        code: costCenter?.code ?? '',
        name: costCenter?.name ?? '',
        parent_id: costCenter?.parent_id?.toString() ?? '',
        status: costCenter?.status ?? true,
    });

    useFlashToastHandler();

    const selectedParent = parents.find(
        (parent) => String(parent.id) === data.parent_id,
    );

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (editing && costCenter) {
            put(route('cost-centers.update', costCenter.id), {
                preserveScroll: true,
            });
        } else {
            post(route('cost-centers.store'), {
                preserveScroll: true,
            });
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'General Accounting', href: '' },
        { title: 'Cost Centers', href: route('cost-centers.index') },
        {
            title: editing ? 'Edit Cost Center' : 'Create Cost Center',
            href: '',
        },
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={editing ? 'Edit Cost Center' : 'Create Cost Center'} />

            <div className="w-full min-w-0 space-y-3 pb-4 text-foreground">
                {/* Page header */}
                <div className="flex min-w-0 flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 items-start gap-2">
                        <FolderTree className="mt-1 size-4 shrink-0 text-primary" />
                        <div className="min-w-0 flex-1">
                            <HeadingSmall
                                title={
                                    editing
                                        ? 'Edit Cost Center'
                                        : 'Create Cost Center'
                                }
                                description="Organize departments, branches, projects, and other units for expense tracking."
                            />

                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/70 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                    <Layers3 className="size-3" />
                                    General Accounting
                                </span>

                                <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-medium text-primary">
                                    <Check className="size-3" />
                                    {editing ? 'Editing record' : 'New record'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        asChild
                        className="h-9 w-full shrink-0 sm:w-auto"
                    >
                        <Link href={route('cost-centers.index')}>
                            <ArrowLeft className="mr-2 size-4" />
                            Back to cost centers
                        </Link>
                    </Button>
                </div>

                <form
                    onSubmit={submit}
                    className="grid min-w-0 items-start gap-3 xl:grid-cols-[minmax(0,1fr)_300px]"
                >
                    {/* Main form */}
                    <section className="min-w-0 overflow-hidden rounded-xl border border-border/80 bg-card">
                        <div className="flex items-center gap-2.5 border-b border-border bg-muted/20 px-3 py-2.5">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <FolderTree className="size-4" />
                            </div>

                            <div className="min-w-0">
                                <h2 className="text-sm font-semibold">
                                    Cost center details
                                </h2>
                                <p className="text-[11px] leading-4 text-muted-foreground">
                                    Configure the cost center identity,
                                    organizational placement, and status.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 p-3">
                            {/* Basic information */}
                            <section className="space-y-2">
                                <div className="flex items-start gap-3">
                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                        <Layers3 className="size-4" />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold">
                                            Basic information
                                        </h3>
                                        <p className="text-[11px] leading-4 text-muted-foreground">
                                            Use a unique code and a clear,
                                            recognizable name.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="min-w-0 space-y-1">
                                        <Label htmlFor="cost-center-code">
                                            Cost center code
                                        </Label>

                                        <Input
                                            id="cost-center-code"
                                            value={data.code}
                                            onChange={(event) =>
                                                setData(
                                                    'code',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="e.g. FIN-001"
                                            className="mt-1 h-9"
                                            required
                                            aria-invalid={Boolean(errors.code)}
                                        />

                                        <InputError message={errors.code} />
                                    </div>

                                    <div className="min-w-0 space-y-1">
                                        <Label htmlFor="cost-center-name">
                                            Cost center name
                                        </Label>

                                        <Input
                                            id="cost-center-name"
                                            value={data.name}
                                            onChange={(event) =>
                                                setData(
                                                    'name',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="e.g. Finance Department"
                                            className="mt-1 h-9"
                                            required
                                            aria-invalid={Boolean(errors.name)}
                                        />

                                        <InputError message={errors.name} />
                                    </div>
                                </div>
                            </section>

                            {/* Organization hierarchy */}
                            <section className="space-y-2 border-t border-border pt-3">
                                <div className="flex items-start gap-3">
                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                        <FolderTree className="size-4" />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold">
                                            Organization hierarchy
                                        </h3>
                                        <p className="text-[11px] leading-4 text-muted-foreground">
                                            Optionally nest this unit under an
                                            existing cost center.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="parent-cost-center">
                                        Parent cost center
                                    </Label>

                                    <Select
                                        id="parent-cost-center"
                                        className="mt-1 h-9 w-full"
                                        value={data.parent_id}
                                        onChange={(value) =>
                                            setData('parent_id', value)
                                        }
                                        options={[
                                            {
                                                value: '',
                                                label: 'None — top-level cost center',
                                            },
                                            ...parents.map((parent) => ({
                                                value: String(parent.id),
                                                label: `${parent.code} — ${parent.name}`,
                                            })),
                                        ]}
                                    />

                                    <InputError message={errors.parent_id} />

                                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                                        Leave empty if this cost center should
                                        sit at the top of the hierarchy.
                                    </p>
                                </div>

                                <div className="flex items-start gap-2 rounded-lg border border-primary/15 bg-primary/5 p-2.5">
                                    <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" />

                                    <div className="min-w-0">
                                        <p className="text-[11px] font-semibold">
                                            Current placement
                                        </p>

                                        <p className="text-[11px] leading-4 break-words text-muted-foreground">
                                            {selectedParent
                                                ? `${selectedParent.code} — ${selectedParent.name}`
                                                : 'This will be a top-level cost center.'}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Status */}
                            <section className="space-y-2 border-t border-border pt-3">
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className="text-sm font-semibold">
                                        Availability
                                    </h3>
                                    <p className="text-[11px] text-muted-foreground">
                                        Expense allocation
                                    </p>
                                </div>

                                <label
                                    htmlFor="cost-center-status"
                                    className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 transition-colors ${
                                        data.status
                                            ? 'border-primary/30 bg-primary/5'
                                            : 'border-border bg-background hover:bg-muted/30'
                                    }`}
                                >
                                    <Input
                                        id="cost-center-status"
                                        type="checkbox"
                                        checked={data.status}
                                        onChange={(event) =>
                                            setData(
                                                'status',
                                                event.target.checked,
                                            )
                                        }
                                        className="size-4 shrink-0 accent-primary"
                                    />

                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-medium">
                                            Active cost center
                                        </span>

                                        <span className="block text-[11px] leading-4 text-muted-foreground">
                                            {data.status
                                                ? 'Available for expense allocation and selection.'
                                                : 'Inactive cost centers may be unavailable for new allocations.'}
                                        </span>
                                    </span>

                                    <span
                                        className={`mt-0.5 size-2 shrink-0 rounded-full ${
                                            data.status
                                                ? 'bg-emerald-500'
                                                : 'bg-muted-foreground/50'
                                        }`}
                                    />
                                </label>
                            </section>
                        </div>
                    </section>

                    {/* Preview sidebar */}
                    <aside className="min-w-0 space-y-3 xl:sticky xl:top-4">
                        <section className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
                            <div className="flex items-center gap-2.5 border-b border-border px-3 py-2.5">
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Layers3 className="size-4" />
                                </div>

                                <div className="min-w-0">
                                    <h2 className="text-sm font-semibold">
                                        Live preview
                                    </h2>
                                    <p className="text-[11px] text-muted-foreground">
                                        Updates as you edit
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 p-3">
                                <div className="flex min-w-0 items-start gap-2.5 rounded-lg border border-primary/15 bg-primary/5 p-2.5">
                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <FolderTree className="size-4" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="font-mono text-xs font-semibold break-words text-primary">
                                            {data.code || 'COST-CENTER-CODE'}
                                        </p>

                                        <p className="mt-1 text-sm font-semibold break-words">
                                            {data.name || 'Cost center name'}
                                        </p>
                                    </div>
                                </div>

                                <dl className="divide-y divide-border">
                                    <div className="flex items-center justify-between gap-3 py-2">
                                        <dt className="text-xs text-muted-foreground">
                                            Status
                                        </dt>

                                        <dd
                                            className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                                                data.status
                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                    : 'text-muted-foreground'
                                            }`}
                                        >
                                            <span
                                                className={`size-1.5 rounded-full ${
                                                    data.status
                                                        ? 'bg-emerald-500'
                                                        : 'bg-muted-foreground/50'
                                                }`}
                                            />

                                            {data.status
                                                ? 'Active'
                                                : 'Inactive'}
                                        </dd>
                                    </div>

                                    <div className="flex items-start justify-between gap-3 py-2">
                                        <dt className="pt-0.5 text-xs text-muted-foreground">
                                            Parent
                                        </dt>

                                        <dd className="max-w-[65%] text-right text-xs leading-relaxed font-medium">
                                            {selectedParent
                                                ? `${selectedParent.code} — ${selectedParent.name}`
                                                : 'Top-level'}
                                        </dd>
                                    </div>

                                    <div className="flex items-center justify-between gap-3 py-2">
                                        <dt className="text-xs text-muted-foreground">
                                            Record
                                        </dt>

                                        <dd className="text-xs font-medium">
                                            {editing ? 'Existing' : 'New'}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </section>

                        <section className="rounded-xl border border-border/80 bg-muted/20 p-3">
                            <div className="flex items-start gap-2.5">
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <CircleHelp className="size-3.5" />
                                </div>

                                <div className="min-w-0">
                                    <h3 className="text-sm font-semibold">
                                        Helpful tips
                                    </h3>

                                    <ul className="mt-2 space-y-2 text-[11px] leading-4 text-muted-foreground">
                                        <li>
                                            Choose a consistent code format that
                                            is easy to recognize.
                                        </li>
                                        <li>
                                            Use parent cost centers to organize
                                            departments and reporting levels.
                                        </li>
                                        <li>
                                            Keep inactive cost centers for
                                            historical reporting where needed.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </section>
                    </aside>

                    {/* Sticky form actions */}
                    <div
                        data-slot="page-sticky-action-bar"
                        className="sticky bottom-0 z-10 flex flex-col-reverse gap-2 border-t border-border bg-card/95 px-3 py-2.5 backdrop-blur supports-[backdrop-filter]:bg-card/85 sm:flex-row sm:items-center sm:justify-between xl:col-span-full"
                    >
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            Review the details before saving.
                        </p>

                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                asChild
                                className="h-9 w-full sm:w-auto"
                            >
                                <Link href={route('cost-centers.index')}>
                                    Cancel
                                </Link>
                            </Button>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="h-9 w-full sm:w-auto"
                            >
                                {processing ? (
                                    <LoaderCircle className="mr-2 size-4 animate-spin" />
                                ) : (
                                    <Check className="mr-2 size-4" />
                                )}

                                {processing
                                    ? 'Saving...'
                                    : editing
                                      ? 'Save changes'
                                      : 'Create cost center'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
