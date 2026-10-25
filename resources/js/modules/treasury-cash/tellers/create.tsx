import type { TellerCreatePageProps } from '@/modules/treasury-cash/types/treasury-cash/forms';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Banknote,
    Check,
    CheckCircle2,
    CircleDollarSign,
    Info,
    ShieldCheck,
    UserRound,
    Wallet,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { route } from 'ziggy-js';

import { ResourcePageHeader } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem } from '@/types';

type Teller = {
    id: number;
    user_id: string;
    code: string;
    name: string;
    maximum_cash: string | number;
    status: 'ACTIVE' | 'INACTIVE' | 'CLOSED';
    cash_location?: {
        branch_id?: number | string;
    };
};

type Props = {
    teller?: Teller | null;
    branch_locked?: boolean;
};

export default function Create({ teller, branch_locked = false }: Props) {
    const editing = Boolean(teller);

    const {
        users = [],
        branches = [],
        default_branch_id,
    } = usePage<TellerCreatePageProps>().props;

    const { data, setData, post, put, processing, errors } = useForm({
        branch_id: String(
            teller?.cash_location?.branch_id ??
                default_branch_id ??
                branches[0]?.id ??
                '',
        ),
        user_id: String(teller?.user_id ?? ''),
        code: teller?.code ?? '',
        name: teller?.name ?? '',
        maximum_cash: String(teller?.maximum_cash ?? ''),
        status: teller?.status ?? 'ACTIVE',
    });

    useFlashToastHandler();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Cash Management', href: '' },
        { title: 'Tellers', href: route('tellers.index') },
        { title: editing ? 'Edit Teller' : 'Create Teller', href: '' },
    ];

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (editing && teller) {
            put(route('tellers.update', teller.id));
        } else {
            post(route('tellers.store'));
        }
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={editing ? 'Edit Teller' : 'Create Teller'} />

            <div className="w-full max-w-4xl space-y-5 pb-24 text-foreground">
                <ResourcePageHeader
                    title={editing ? 'Edit Teller' : 'Create Teller'}
                    description={
                        editing
                            ? 'Update teller assignments, cash limits, and operational status.'
                            : 'Register a teller, assign a branch user, and configure cash handling limits.'
                    }
                />

                {/* Page introduction */}
                <div className="relative overflow-hidden rounded-xl border bg-card">
                    <div className="flex items-start gap-4 p-4 sm:p-5">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border bg-muted/60">
                            <Banknote className="size-6 text-primary" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-base font-semibold tracking-tight">
                                    {editing
                                        ? 'Teller configuration'
                                        : 'New teller setup'}
                                </h2>

                                <span className="inline-flex items-center gap-1 rounded-full border bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                    <ShieldCheck className="size-3.5" />
                                    Cash management
                                </span>
                            </div>

                            <p className="mt-1 text-sm leading-5 text-muted-foreground">
                                {editing
                                    ? 'Review the current configuration and make the necessary changes.'
                                    : 'Complete the teller profile and operating controls before saving.'}
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    {/* Teller identity */}
                    <section className="overflow-hidden rounded-xl border bg-card">
                        <div className="flex items-start gap-3 border-b px-4 py-4 sm:px-5">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <UserRound className="size-4.5" />
                            </div>

                            <div className="min-w-0">
                                <h2 className="text-sm font-semibold">
                                    Teller identity
                                </h2>
                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                    Specify the branch, responsible user, and
                                    teller identification details.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-x-5 gap-y-4 p-4 sm:grid-cols-2 sm:p-5">
                            <div className="space-y-2">
                                <label
                                    htmlFor="branch_id"
                                    className="text-sm font-medium"
                                >
                                    Branch{' '}
                                    <span className="text-destructive">*</span>
                                </label>

                                <Select
                                    id="branch_id"
                                    className="h-10 w-full"
                                    value={data.branch_id}
                                    disabled={editing && branch_locked}
                                    onChange={(value) =>
                                        setData('branch_id', value)
                                    }
                                    placeholder="Select branch"
                                    options={[
                                        { value: '', label: 'Select branch' },
                                        ...branches.map((branch) => ({
                                            value: String(branch.id),
                                            label: `${branch.name} (${branch.code})`,
                                        })),
                                    ]}
                                />

                                {errors.branch_id && (
                                    <p className="text-xs text-destructive">
                                        {errors.branch_id}
                                    </p>
                                )}

                                {editing && branch_locked && (
                                    <p className="flex items-start gap-1.5 text-xs leading-5 text-muted-foreground">
                                        <Info className="mt-0.5 size-3.5 shrink-0" />
                                        Branch changes are restricted because
                                        teller activity exists.
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="user_id"
                                    className="text-sm font-medium"
                                >
                                    Assigned user{' '}
                                    <span className="text-destructive">*</span>
                                </label>

                                <Select
                                    id="user_id"
                                    className="h-10 w-full"
                                    value={data.user_id}
                                    onChange={(value) =>
                                        setData('user_id', value)
                                    }
                                    placeholder="Select user"
                                    options={[
                                        { value: '', label: 'Select user' },
                                        ...users.map((user) => ({
                                            value: String(user.id),
                                            label: `${user.name} (${user.email})`,
                                        })),
                                    ]}
                                />

                                {errors.user_id && (
                                    <p className="text-xs text-destructive">
                                        {errors.user_id}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="code"
                                    className="text-sm font-medium"
                                >
                                    Teller code{' '}
                                    <span className="text-destructive">*</span>
                                </label>

                                <Input
                                    id="code"
                                    value={data.code}
                                    onChange={(event) =>
                                        setData('code', event.target.value)
                                    }
                                    placeholder="e.g. TEL-001"
                                    autoComplete="off"
                                    required
                                    aria-invalid={Boolean(errors.code)}
                                    className="h-10"
                                />

                                {errors.code && (
                                    <p className="text-xs text-destructive">
                                        {errors.code}
                                    </p>
                                )}

                                <p className="text-xs text-muted-foreground">
                                    Use a unique identifier for this teller.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="name"
                                    className="text-sm font-medium"
                                >
                                    Teller name{' '}
                                    <span className="text-destructive">*</span>
                                </label>

                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(event) =>
                                        setData('name', event.target.value)
                                    }
                                    placeholder="Enter teller name"
                                    required
                                    aria-invalid={Boolean(errors.name)}
                                    className="h-10"
                                />

                                {errors.name && (
                                    <p className="text-xs text-destructive">
                                        {errors.name}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Operating controls */}
                    <section className="overflow-hidden rounded-xl border bg-card">
                        <div className="flex items-start gap-3 border-b px-4 py-4 sm:px-5">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Wallet className="size-4.5" />
                            </div>

                            <div className="min-w-0">
                                <h2 className="text-sm font-semibold">
                                    Operating controls
                                </h2>
                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                    Establish the permitted cash exposure and
                                    teller availability.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-x-5 gap-y-4 p-4 sm:grid-cols-2 sm:p-5">
                            <div className="space-y-2">
                                <label
                                    htmlFor="maximum_cash"
                                    className="text-sm font-medium"
                                >
                                    Maximum cash limit
                                </label>

                                <div className="relative">
                                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-semibold text-muted-foreground">
                                        ৳
                                    </span>

                                    <Input
                                        id="maximum_cash"
                                        type="number"
                                        min="0"
                                        step="0.0001"
                                        value={data.maximum_cash}
                                        onChange={(event) =>
                                            setData(
                                                'maximum_cash',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="0.00"
                                        aria-invalid={Boolean(
                                            errors.maximum_cash,
                                        )}
                                        className="h-10 pl-8 tabular-nums"
                                    />
                                </div>

                                {errors.maximum_cash && (
                                    <p className="text-xs text-destructive">
                                        {errors.maximum_cash}
                                    </p>
                                )}

                                <p className="text-xs text-muted-foreground">
                                    Maximum permitted cash exposure for this
                                    teller.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="status"
                                    className="text-sm font-medium"
                                >
                                    Operational status
                                </label>

                                <Select
                                    id="status"
                                    className="h-10 w-full"
                                    value={data.status}
                                    onChange={(value) =>
                                        setData(
                                            'status',
                                            value as
                                                | 'ACTIVE'
                                                | 'INACTIVE'
                                                | 'CLOSED',
                                        )
                                    }
                                    options={[
                                        { value: 'ACTIVE', label: 'Active' },
                                        {
                                            value: 'INACTIVE',
                                            label: 'Inactive',
                                        },
                                        { value: 'CLOSED', label: 'Closed' },
                                    ]}
                                />

                                <p className="text-xs text-muted-foreground">
                                    {data.status === 'ACTIVE'
                                        ? 'The teller is marked as active.'
                                        : data.status === 'INACTIVE'
                                          ? 'The teller is marked as inactive.'
                                          : 'The teller is marked as closed.'}
                                </p>
                            </div>
                        </div>

                        <div className="mx-4 mb-4 flex items-start gap-2.5 rounded-lg border bg-muted/30 p-3 sm:mx-5 sm:mb-5">
                            <CircleDollarSign className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                            <p className="text-xs leading-5 text-muted-foreground">
                                Configure the cash limit according to your
                                organization's internal cash handling policy.
                                The backend should enforce this limit during
                                transactions.
                            </p>
                        </div>
                    </section>

                    {/* Form actions */}
                    <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:left-[var(--app-sidebar-offset,0px)]">
                        <div className="ml-4 flex w-[calc(100%-2rem)] max-w-4xl flex-col-reverse gap-2 py-3 sm:flex-row sm:items-center sm:justify-between md:ml-6 md:w-[calc(100%-3rem)]">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.history.back()}
                                disabled={processing}
                                className="h-10 gap-2 rounded-lg px-4"
                            >
                                <Info className="size-4" />
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                disabled={
                                    processing ||
                                    (branches.length === 0 &&
                                        !(editing && branch_locked))
                                }
                                className="h-10 gap-2 rounded-lg px-5"
                            >
                                {processing ? (
                                    <>
                                        <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        {editing ? (
                                            <CheckCircle2 className="size-4" />
                                        ) : (
                                            <Check className="size-4" />
                                        )}
                                        {editing
                                            ? 'Save changes'
                                            : 'Create teller'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
