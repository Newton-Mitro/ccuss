import type { TellerCreatePageProps } from '@/modules/treasury-cash/types/forms';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Banknote,
    Building2,
    Check,
    CheckCircle2,
    CircleDollarSign,
    Eye,
    Info,
    ShieldCheck,
    UserRound,
    Wallet,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { route } from 'ziggy-js';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { Props } from '@/modules/treasury-cash/types/tellers/create.types';
import type { BreadcrumbItem } from '@/types';

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
    const selectedBranch = branches.find(
        (branch) => String(branch.id) === data.branch_id,
    );
    const selectedUser = users.find((user) => String(user.id) === data.user_id);

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

            <div className="w-full max-w-screen-xl space-y-5 pb-8 text-foreground">
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <HeadingSmall
                        title={editing ? 'Edit Teller' : 'Create Teller'}
                        description={
                            editing
                                ? 'Update teller assignments, cash limits, and operational status.'
                                : 'Register a teller, assign a branch user, and configure cash handling limits.'
                        }
                    />
                </div>

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
                    <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
                        <div className="min-w-0 space-y-4">
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
                                            Specify the branch, responsible
                                            user, and teller identification
                                            details.
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
                                            <span className="text-destructive">
                                                *
                                            </span>
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
                                                {
                                                    value: '',
                                                    label: 'Select branch',
                                                },
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
                                                Branch changes are restricted
                                                because teller activity exists.
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label
                                            htmlFor="user_id"
                                            className="text-sm font-medium"
                                        >
                                            Assigned user{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
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
                                                {
                                                    value: '',
                                                    label: 'Select user',
                                                },
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
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </label>

                                        <Input
                                            id="code"
                                            value={data.code}
                                            onChange={(event) =>
                                                setData(
                                                    'code',
                                                    event.target.value,
                                                )
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
                                            Use a unique identifier for this
                                            teller.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label
                                            htmlFor="name"
                                            className="text-sm font-medium"
                                        >
                                            Teller name{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </label>

                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(event) =>
                                                setData(
                                                    'name',
                                                    event.target.value,
                                                )
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
                                            Establish the permitted cash
                                            exposure and teller availability.
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
                                            Maximum permitted cash exposure for
                                            this teller.
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
                                                {
                                                    value: 'ACTIVE',
                                                    label: 'Active',
                                                },
                                                {
                                                    value: 'INACTIVE',
                                                    label: 'Inactive',
                                                },
                                                {
                                                    value: 'CLOSED',
                                                    label: 'Closed',
                                                },
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
                                        Configure the cash limit according to
                                        your organization's internal cash
                                        handling policy. The backend should
                                        enforce this limit during transactions.
                                    </p>
                                </div>
                            </section>
                        </div>

                        <aside className="min-w-0 xl:sticky xl:top-4 xl:self-start">
                            <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-lg ring-1 shadow-primary/[0.04] ring-foreground/[0.02]">
                                <div className="relative overflow-hidden border-b bg-gradient-to-br from-primary/[0.12] via-primary/[0.04] to-transparent px-4 py-4">
                                    <div className="pointer-events-none absolute -top-10 right-0 size-28 rounded-full bg-primary/10 blur-3xl" />
                                    <div className="relative flex items-center gap-2.5">
                                        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                                            <Eye className="size-4" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] font-semibold tracking-[0.14em] text-primary uppercase">
                                                Cash operations
                                            </p>
                                            <h2 className="text-sm font-semibold">
                                                Teller preview
                                            </h2>
                                        </div>
                                        <span className="rounded-full border border-primary/15 bg-background/80 px-2 py-1 text-[10px] font-semibold text-primary">
                                            LIVE
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3 p-3">
                                    <div className="rounded-xl bg-gradient-to-br from-primary/[0.08] to-muted/30 p-3.5 ring-1 ring-primary/10">
                                        <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                            Teller
                                        </p>
                                        <p className="mt-1 text-base font-semibold break-words">
                                            {data.name || 'Teller name'}
                                        </p>
                                        <p className="mt-1 font-mono text-xs text-muted-foreground">
                                            {data.code || 'TELLER-CODE'}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-primary/15 bg-primary/[0.06] p-3.5">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <CircleDollarSign className="size-4 text-primary" />
                                            Maximum cash limit
                                        </div>
                                        <p className="mt-1.5 text-2xl font-semibold tracking-tight text-primary tabular-nums">
                                            {data.maximum_cash
                                                ? `৳ ${new Intl.NumberFormat(
                                                      'en-BD',
                                                      {
                                                          minimumFractionDigits: 2,
                                                          maximumFractionDigits: 2,
                                                      },
                                                  ).format(
                                                      Number(data.maximum_cash),
                                                  )}`
                                                : 'Not set'}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        {[
                                            {
                                                label: 'Branch',
                                                value: selectedBranch
                                                    ? `${selectedBranch.name} (${selectedBranch.code})`
                                                    : 'Not selected',
                                                icon: Building2,
                                            },
                                            {
                                                label: 'Assigned user',
                                                value:
                                                    selectedUser?.name ??
                                                    'Not assigned',
                                                icon: UserRound,
                                            },
                                        ].map((item) => {
                                            const ItemIcon = item.icon;
                                            return (
                                                <div
                                                    key={item.label}
                                                    className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5"
                                                >
                                                    <span className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                                                        <ItemIcon className="size-3.5 shrink-0" />
                                                        {item.label}
                                                    </span>
                                                    <span className="min-w-0 text-right text-xs font-medium break-words">
                                                        {item.value}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div
                                        className={`flex items-center gap-2 rounded-xl px-3.5 py-3 text-xs font-medium ${
                                            data.status === 'ACTIVE'
                                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                                : data.status === 'INACTIVE'
                                                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                                                  : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        <span className="size-2 rounded-full bg-current" />
                                        Operational status: {data.status}
                                    </div>

                                    <div className="flex items-start gap-2 rounded-xl border border-border/60 px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
                                        <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
                                        Cash limit is an operational control for
                                        this teller.
                                    </div>
                                </div>
                            </section>
                        </aside>
                    </div>

                    {/* Form actions */}
                    <div className="border-t bg-background/95 py-3">
                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
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
