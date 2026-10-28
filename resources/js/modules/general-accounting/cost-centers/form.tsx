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

            <div className="w-full min-w-0 space-y-5 pb-10 text-foreground sm:space-y-6">
                {/* Page header */}
                <div className="flex min-w-0 flex-col justify-between gap-4 rounded-2xl border border-border bg-linear-to-r from-primary/10 via-card to-card p-4 shadow-sm sm:flex-row sm:items-center sm:p-6">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary sm:size-12">
                            <FolderTree className="size-5 sm:size-6" />
                        </div>

                        <div className="min-w-0">
                            <HeadingSmall
                                title={
                                    editing
                                        ? 'Edit Cost Center'
                                        : 'Create Cost Center'
                                }
                                description="Organize departments, branches, projects, and other units for expense tracking."
                            />

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                                    <Layers3 className="size-3.5" />
                                    General Accounting
                                </span>

                                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary">
                                    <Check className="size-3.5" />
                                    {editing ? 'Editing record' : 'New record'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        asChild
                        className="w-full shrink-0 sm:w-auto"
                    >
                        <Link href={route('cost-centers.index')}>
                            <ArrowLeft className="mr-2 size-4" />
                            Back to cost centers
                        </Link>
                    </Button>
                </div>

                <form
                    onSubmit={submit}
                    className="grid min-w-0 items-start gap-5 xl:grid-cols-3"
                >
                    {/* Main form */}
                    <section className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm xl:col-span-2">
                        <div className="flex items-start gap-3 border-b border-border bg-muted/20 px-4 py-4 sm:px-6">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <FolderTree className="size-5" />
                            </div>

                            <div className="min-w-0">
                                <h2 className="text-sm font-semibold">
                                    Cost center details
                                </h2>
                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                    Configure the cost center identity,
                                    organizational placement, and status.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-7 p-4 sm:p-6">
                            {/* Basic information */}
                            <section className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                        <Layers3 className="size-4" />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold">
                                            Basic information
                                        </h3>
                                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                            Use a unique code and a clear,
                                            recognizable name.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="min-w-0 space-y-1.5">
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
                                            className="h-10"
                                            required
                                            aria-invalid={Boolean(errors.code)}
                                        />

                                        <InputError message={errors.code} />
                                    </div>

                                    <div className="min-w-0 space-y-1.5">
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
                                            className="h-10"
                                            required
                                            aria-invalid={Boolean(errors.name)}
                                        />

                                        <InputError message={errors.name} />
                                    </div>
                                </div>
                            </section>

                            {/* Organization hierarchy */}
                            <section className="space-y-4 border-t border-border pt-6">
                                <div className="flex items-start gap-3">
                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                        <FolderTree className="size-4" />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold">
                                            Organization hierarchy
                                        </h3>
                                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                            Optionally nest this unit under an
                                            existing cost center.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="parent-cost-center">
                                        Parent cost center
                                    </Label>

                                    <Select
                                        id="parent-cost-center"
                                        className="h-10 w-full"
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

                                <div className="flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/5 p-4">
                                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />

                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold">
                                            Current placement
                                        </p>

                                        <p className="mt-1 text-sm leading-relaxed break-words text-muted-foreground">
                                            {selectedParent
                                                ? `${selectedParent.code} — ${selectedParent.name}`
                                                : 'This will be a top-level cost center.'}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Status */}
                            <section className="border-t border-border pt-6">
                                <div className="mb-4">
                                    <h3 className="text-sm font-semibold">
                                        Availability
                                    </h3>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Control whether this cost center is
                                        available for expense allocation.
                                    </p>
                                </div>

                                <label
                                    htmlFor="cost-center-status"
                                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
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
                                        className="mt-0.5 size-4 shrink-0 accent-primary"
                                    />

                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-medium">
                                            Active cost center
                                        </span>

                                        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
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

                        {/* Sticky form actions */}
                        <div className="sticky bottom-0 z-10 flex flex-col-reverse gap-3 border-t border-border bg-card/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-card/85 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                Review the details before saving.
                            </p>

                            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    asChild
                                    className="w-full sm:w-auto"
                                >
                                    <Link href={route('cost-centers.index')}>
                                        Cancel
                                    </Link>
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full sm:w-auto"
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
                    </section>

                    {/* Preview sidebar */}
                    <aside className="min-w-0 space-y-4 xl:sticky xl:top-5">
                        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                            <div className="flex items-center gap-3 border-b border-border px-4 py-4">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Layers3 className="size-4" />
                                </div>

                                <div className="min-w-0">
                                    <h2 className="text-sm font-semibold">
                                        Live preview
                                    </h2>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        Updates as you edit
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 p-4">
                                <div className="flex min-w-0 items-start gap-3 rounded-xl border border-primary/15 bg-primary/5 p-3.5">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <FolderTree className="size-5" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="font-mono text-xs font-semibold break-words text-primary">
                                            {data.code || 'COST-CENTER-CODE'}
                                        </p>

                                        <p className="mt-1.5 text-sm font-semibold break-words">
                                            {data.name || 'Cost center name'}
                                        </p>
                                    </div>
                                </div>

                                <dl className="divide-y divide-border">
                                    <div className="flex items-center justify-between gap-3 py-3">
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

                                    <div className="flex items-start justify-between gap-3 py-3">
                                        <dt className="pt-0.5 text-xs text-muted-foreground">
                                            Parent
                                        </dt>

                                        <dd className="max-w-[65%] text-right text-xs leading-relaxed font-medium">
                                            {selectedParent
                                                ? `${selectedParent.code} — ${selectedParent.name}`
                                                : 'Top-level'}
                                        </dd>
                                    </div>

                                    <div className="flex items-center justify-between gap-3 py-3">
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

                        <section className="rounded-2xl border border-border bg-muted/20 p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <CircleHelp className="size-4" />
                                </div>

                                <div className="min-w-0">
                                    <h3 className="text-sm font-semibold">
                                        Helpful tips
                                    </h3>

                                    <ul className="mt-2.5 space-y-2.5 text-xs leading-relaxed text-muted-foreground">
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
                </form>
            </div>
        </CustomAuthLayout>
    );
}
