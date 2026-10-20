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
    FolderTree,
    Layers3,
    LoaderCircle,
    MapPin,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { route } from 'ziggy-js';

interface CostCenter {
    id: number;
    code: string;
    name: string;
    parent_id: number | null;
    status: boolean;
}

interface CostCenterParent {
    id: number;
    code: string;
    name: string;
}

interface Props {
    costCenter?: CostCenter;
    parents?: CostCenterParent[];
}

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
            post(route('cost-centers.store'), { preserveScroll: true });
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

            <div className="mx-auto w-full max-w-6xl space-y-6 pb-8 text-foreground">
                <ResourcePageHeader
                    title={editing ? 'Edit Cost Center' : 'Create Cost Center'}
                    description="Organize departments, branches, projects, and other units for expense tracking."
                    action={
                        <Button variant="outline" asChild>
                            <Link href={route('cost-centers.index')}>
                                <ArrowLeft className="mr-2 size-4" />
                                Back to cost centers
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
                                <FolderTree className="size-5" />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold">
                                    Cost center details
                                </h2>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Provide an identifier and choose where this
                                    unit belongs.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6 p-5 sm:p-6">
                            <section className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-semibold">
                                        Basic information
                                    </h3>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Use a unique code and a clear,
                                        recognizable name.
                                    </p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
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

                                    <div className="space-y-1.5">
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

                            <section className="space-y-4 border-t border-border pt-5">
                                <div>
                                    <h3 className="text-sm font-semibold">
                                        Organization hierarchy
                                    </h3>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Add a parent to nest this unit under an
                                        existing cost center.
                                    </p>
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
                                </div>

                                <div className="flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/5 p-4">
                                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold">
                                            Current placement
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {selectedParent
                                                ? `${selectedParent.code} — ${selectedParent.name}`
                                                : 'This will be a top-level cost center.'}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section className="flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/80 bg-background/70 px-4 py-3">
                                    <Input
                                        type="checkbox"
                                        checked={data.status}
                                        onChange={(event) =>
                                            setData(
                                                'status',
                                                event.target.checked,
                                            )
                                        }
                                        className="size-4 accent-primary"
                                    />
                                    <span>
                                        <span className="block text-sm font-medium">
                                            Active cost center
                                        </span>
                                        <span className="mt-0.5 block text-xs text-muted-foreground">
                                            Available for expense allocation
                                        </span>
                                    </span>
                                </label>

                                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        asChild
                                    >
                                        <Link
                                            href={route('cost-centers.index')}
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
                                              : 'Create cost center'}
                                    </Button>
                                </div>
                            </section>
                        </div>
                    </section>

                    <aside className="space-y-4 lg:sticky lg:top-4">
                        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                            <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Layers3 className="size-4" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold">
                                        Live preview
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        Cost center identity
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-3 p-4">
                                <div className="rounded-xl border border-primary/15 bg-primary/5 p-3.5">
                                    <p className="font-mono text-xs font-semibold text-primary">
                                        {data.code || 'CODE'}
                                    </p>
                                    <p className="mt-1.5 text-sm font-semibold">
                                        {data.name || 'Cost center name'}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/70 px-3.5 py-3">
                                    <span className="text-xs text-muted-foreground">
                                        Status
                                    </span>
                                    <span
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
                                        {data.status ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="rounded-xl border border-border/70 bg-background/70 px-3.5 py-3">
                                    <p className="text-xs text-muted-foreground">
                                        Parent
                                    </p>
                                    <p className="mt-1 text-sm font-medium">
                                        {selectedParent
                                            ? selectedParent.name
                                            : 'Top-level'}
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-border bg-muted/20 p-4">
                            <div className="flex items-start gap-2.5">
                                <CircleHelp className="mt-0.5 size-4 shrink-0 text-primary" />
                                <div>
                                    <h3 className="text-xs font-semibold">
                                        Helpful tips
                                    </h3>
                                    <ul className="mt-2 space-y-2 text-xs leading-relaxed text-muted-foreground">
                                        <li>
                                            Choose a consistent code format that
                                            is easy to recognize.
                                        </li>
                                        <li>
                                            Use a parent cost center to create
                                            clear reporting levels.
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
