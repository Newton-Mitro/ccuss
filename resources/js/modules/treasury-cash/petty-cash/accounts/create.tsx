import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import type { PettyCashAccountCreatePageProps } from '@/modules/treasury-cash/types/forms';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Banknote,
    Building2,
    CheckCircle2,
    CircleDollarSign,
    FileText,
    Landmark,
    LoaderCircle,
    ShieldCheck,
    UserRound,
    Wallet,
} from 'lucide-react';
import { route } from 'ziggy-js';

export default function CreatePettyCashAccount() {
    const {
        branches = [],
        default_branch_id,
        default_custodian_id,
        users = [],
        branch_locked = false,
        fund,
    } = usePage<PettyCashAccountCreatePageProps>().props;

    const editing = Boolean(fund);

    const { data, setData, post, put, processing, errors } = useForm({
        branch_id: String(
            fund?.cash_location?.branch_id ??
                default_branch_id ??
                branches[0]?.id ??
                '',
        ),
        custodian_id: String(fund?.custodian_id ?? default_custodian_id ?? ''),
        code: fund?.code ?? '',
        name: fund?.name ?? '',
        fund_limit: fund?.fund_limit ?? '',
        current_balance: fund?.current_balance ?? '0',
        method: fund?.method ?? 'IMPREST',
        status: fund?.status ?? 'ACTIVE',
    });

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (editing && fund) {
            put(route('petty-cash-accounts.update', fund.id));
            return;
        }

        post(route('petty-cash-accounts.store'), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Petty Cash', href: '' },
        {
            title: 'Petty Cash Accounts',
            href: route('petty-cash-accounts.index'),
        },
        { title: editing ? 'Edit' : 'Create', href: '' },
    ];

    const inputClassName = 'mt-1 h-9 w-full';
    const sectionClassName = 'rounded-xl border bg-card p-3 sm:p-4';

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head
                title={
                    editing ? 'Edit Petty Cash Fund' : 'Create Petty Cash Fund'
                }
            />

            <div className="w-full max-w-none space-y-3 pb-20">
                <header className="flex flex-col gap-2 py-1 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 space-y-1">
                        <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                            Treasury &amp; cash · Petty cash
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-xl leading-tight font-semibold tracking-tight">
                                {editing
                                    ? 'Edit petty cash fund'
                                    : 'Create petty cash fund'}
                            </h1>
                            {editing && (
                                <span className="text-xs font-medium text-muted-foreground">
                                    {fund?.code}
                                </span>
                            )}
                        </div>
                        <p className="text-xs leading-5 text-muted-foreground">
                            {editing
                                ? 'Update fund details, custody, and operational status.'
                                : 'Set up the fund, assign a custodian, and define its financial limits.'}
                        </p>
                    </div>

                    <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                    >
                        <Link href={route('petty-cash-accounts.index')}>
                            <ArrowLeft className="size-4" />
                            Petty cash funds
                        </Link>
                    </Button>
                </header>

                <form onSubmit={submit} className="space-y-3">
                    {/* Fund identity */}
                    <section className={sectionClassName}>
                        <div className="mb-3 flex items-center gap-3">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                                <FileText className="size-4 text-foreground" />
                            </div>

                            <div className="min-w-0">
                                <h2 className="text-sm font-semibold">
                                    Fund information
                                </h2>
                                <p className="text-xs leading-4 text-muted-foreground">
                                    Define the fund's identification and
                                    replenishment method.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="code">
                                    Fund code
                                    <span className="ml-1 text-destructive">
                                        *
                                    </span>
                                </Label>
                                <Input
                                    id="code"
                                    className={inputClassName}
                                    value={data.code}
                                    placeholder="e.g. PC-DHK-001"
                                    autoComplete="off"
                                    onChange={(event) =>
                                        setData('code', event.target.value)
                                    }
                                />
                                <InputError message={errors.code} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="method">
                                    Replenishment method
                                    <span className="ml-1 text-destructive">
                                        *
                                    </span>
                                </Label>
                                <Select
                                    id="method"
                                    className={inputClassName}
                                    value={data.method}
                                    onChange={(value) =>
                                        setData('method', value)
                                    }
                                    options={[
                                        {
                                            value: 'IMPREST',
                                            label: 'Imprest — fixed fund',
                                        },
                                        {
                                            value: 'VARIABLE',
                                            label: 'Variable — flexible fund',
                                        },
                                    ]}
                                />
                                <InputError message={errors.method} />
                                <p className="text-xs leading-4 text-muted-foreground">
                                    Imprest maintains an authorized fund level;
                                    variable allows a flexible fund limit.
                                </p>
                            </div>

                            <div className="space-y-1.5 sm:col-span-2">
                                <Label htmlFor="name">
                                    Fund name
                                    <span className="ml-1 text-destructive">
                                        *
                                    </span>
                                </Label>
                                <Input
                                    id="name"
                                    className={inputClassName}
                                    value={data.name}
                                    placeholder="e.g. Head Office Petty Cash"
                                    onChange={(event) =>
                                        setData('name', event.target.value)
                                    }
                                />
                                <InputError message={errors.name} />
                            </div>
                        </div>
                    </section>

                    {/* Branch and custody */}
                    <section className={sectionClassName}>
                        <div className="mb-3 flex items-center gap-3">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                                <Building2 className="size-4 text-foreground" />
                            </div>

                            <div className="min-w-0">
                                <h2 className="text-sm font-semibold">
                                    Branch & custody
                                </h2>
                                <p className="text-xs leading-4 text-muted-foreground">
                                    Select the branch responsible for the fund
                                    and the user accountable for its custody.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="branch_id">
                                    Branch
                                    <span className="ml-1 text-destructive">
                                        *
                                    </span>
                                </Label>
                                <Select
                                    id="branch_id"
                                    className={inputClassName}
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
                                <InputError message={errors.branch_id} />

                                {editing && branch_locked && (
                                    <p className="flex items-start gap-1.5 text-xs leading-5 text-muted-foreground">
                                        <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
                                        Branch changes are disabled because
                                        transactions already exist.
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="custodian_id">
                                    Fund custodian
                                    <span className="ml-1 text-destructive">
                                        *
                                    </span>
                                </Label>
                                <Select
                                    id="custodian_id"
                                    className={inputClassName}
                                    value={data.custodian_id}
                                    onChange={(value) =>
                                        setData('custodian_id', value)
                                    }
                                    placeholder="Select custodian"
                                    options={[
                                        {
                                            value: '',
                                            label: 'Select custodian',
                                        },
                                        ...users.map((user) => ({
                                            value: String(user.id),
                                            label: `${user.name} (${user.email})`,
                                        })),
                                    ]}
                                />
                                <InputError message={errors.custodian_id} />
                                <p className="text-xs leading-4 text-muted-foreground">
                                    The assigned user responsible for managing
                                    petty cash.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Financial controls */}
                    <section className={sectionClassName}>
                        <div className="mb-3 flex items-center gap-3">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                                <CircleDollarSign className="size-4 text-foreground" />
                            </div>

                            <div className="min-w-0">
                                <h2 className="text-sm font-semibold">
                                    Financial controls
                                </h2>
                                <p className="text-xs leading-4 text-muted-foreground">
                                    Set the authorized fund limit and review the
                                    recorded cash balance.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-lg border bg-background p-3">
                                <div className="mb-2 flex items-center gap-2">
                                    <Landmark className="size-4 text-muted-foreground" />
                                    <Label
                                        htmlFor="fund_limit"
                                        className="font-medium"
                                    >
                                        Fund limit
                                        <span className="ml-1 text-destructive">
                                            *
                                        </span>
                                    </Label>
                                </div>

                                <div className="flex h-9 items-center rounded-md border bg-muted/20 focus-within:border-ring focus-within:ring-1 focus-within:ring-ring">
                                    <span className="pl-3 text-sm font-semibold text-muted-foreground">
                                        ৳
                                    </span>
                                    <Input
                                        id="fund_limit"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="h-full border-0 bg-transparent shadow-none focus-visible:ring-0"
                                        value={data.fund_limit}
                                        placeholder="0.00"
                                        onChange={(event) =>
                                            setData(
                                                'fund_limit',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <InputError message={errors.fund_limit} />
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Maximum authorized fund amount.
                                </p>
                            </div>

                            {!editing ? (
                                <div className="rounded-lg border bg-background p-3">
                                    <div className="mb-2 flex items-center gap-2">
                                        <Banknote className="size-4 text-muted-foreground" />
                                        <Label
                                            htmlFor="current_balance"
                                            className="font-medium"
                                        >
                                            Opening funding amount
                                            <span className="ml-1 text-destructive">
                                                *
                                            </span>
                                        </Label>
                                    </div>

                                    <div className="flex h-9 items-center rounded-md border bg-muted/20 focus-within:border-ring focus-within:ring-1 focus-within:ring-ring">
                                        <span className="pl-3 text-sm font-semibold text-muted-foreground">
                                            ৳
                                        </span>
                                        <Input
                                            id="current_balance"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            className="h-full border-0 bg-transparent shadow-none focus-visible:ring-0"
                                            value={data.current_balance}
                                            placeholder="0.00"
                                            onChange={(event) =>
                                                setData(
                                                    'current_balance',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <InputError
                                        message={errors.current_balance}
                                    />
                                    <p className="mt-1 text-xs leading-4 text-muted-foreground">
                                        A positive amount queues pending
                                        funding. Posting it updates the balance
                                        and creates the voucher; the selected
                                        branch needs an open business day.
                                    </p>
                                </div>
                            ) : (
                                <div className="rounded-lg border bg-muted/30 p-3">
                                    <div className="mb-2 flex items-center gap-2">
                                        <Wallet className="size-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">
                                            Current balance
                                        </span>
                                    </div>

                                    <p className="text-2xl font-semibold tracking-tight tabular-nums">
                                        {formatBDTCurrency(
                                            fund?.current_balance ?? 0,
                                        )}
                                    </p>
                                    <p className="mt-1 text-xs leading-4 text-muted-foreground">
                                        Read-only balance. Use authorized
                                        transactions to change the fund balance.
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Operational status */}
                    <section className={sectionClassName}>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                                    <UserRound className="size-4 text-foreground" />
                                </div>

                                <div>
                                    <h2 className="text-sm font-semibold">
                                        Operational status
                                    </h2>
                                    <p className="text-xs leading-4 text-muted-foreground">
                                        Determine whether this fund is available
                                        for operational use.
                                    </p>
                                </div>
                            </div>

                            <div className="w-full sm:w-64">
                                <Label htmlFor="status" className="sr-only">
                                    Fund status
                                </Label>
                                <Select
                                    id="status"
                                    className="h-9 w-full"
                                    value={data.status}
                                    onChange={(value) =>
                                        setData('status', value)
                                    }
                                    options={[
                                        {
                                            value: 'ACTIVE',
                                            label: 'Active — available',
                                        },
                                        {
                                            value: 'INACTIVE',
                                            label: 'Inactive — unavailable',
                                        },
                                        {
                                            value: 'CLOSED',
                                            label: 'Closed — permanently closed',
                                        },
                                    ]}
                                />
                                <InputError message={errors.status} />
                            </div>
                        </div>
                    </section>

                    {/* Form actions */}
                    <div className="fixed inset-x-4 bottom-0 z-30 border-t bg-background/95 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:inset-x-auto md:right-6 md:left-[calc(var(--app-sidebar-offset,0px)+1.5rem)]">
                        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex">
                                <ShieldCheck className="size-3.5" />
                                Review all details before saving.
                            </p>

                            <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
                                <Button
                                    asChild
                                    type="button"
                                    variant="outline"
                                    disabled={processing}
                                    className="w-full sm:w-auto"
                                >
                                    <Link
                                        href={route(
                                            'petty-cash-accounts.index',
                                        )}
                                    >
                                        Cancel
                                    </Link>
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={
                                        processing || branches.length === 0
                                    }
                                    className="w-full sm:min-w-40"
                                >
                                    {processing ? (
                                        <LoaderCircle className="mr-2 size-4 animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="mr-2 size-4" />
                                    )}
                                    {processing
                                        ? 'Saving...'
                                        : editing
                                          ? 'Save changes'
                                          : 'Create fund'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
