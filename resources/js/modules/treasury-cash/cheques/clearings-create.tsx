import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import type { Props } from '@/modules/treasury-cash/types/cheques/clearings-create.types';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Banknote,
    Building2,
    CalendarDays,
    CircleDollarSign,
    Eye,
    Landmark,
    Plus,
    RefreshCw,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { route } from 'ziggy-js';

export default function CreateChequeClearing({
    cheques,
    branches,
    default_branch_id,
}: Props) {
    const form = useForm({
        cheque_id: '',
        branch_id: default_branch_id ? String(default_branch_id) : '',
        clearing_no: '',
        drawer_bank_name: '',
        drawer_bank_branch: '',
        drawer_account_no: '',
    });
    const selectedCheque = cheques.find(
        (cheque) => String(cheque.id) === form.data.cheque_id,
    );
    const selectedBranch = branches.find(
        (branch) => String(branch.id) === form.data.branch_id,
    );

    useFlashToastHandler();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: route('treasury-cash.dashboard') },
        { title: 'Cheque Clearings', href: route('cheque-clearings.index') },
        { title: 'New Clearing', href: '' },
    ];

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(route('cheque-clearings.store'));
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="New Cheque Clearing" />
            <div className="w-full max-w-7xl space-y-5 pb-24 text-foreground">
                <div className="flex flex-col gap-4 rounded-2xl border border-border bg-linear-to-r from-primary/10 via-card to-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                        <HeadingSmall
                            title="New cheque clearing"
                            description="Create a clearing record for a presented cheque."
                        />
                    </div>
                    <Button asChild variant="outline" className="gap-2">
                        <Link href={route('cheque-clearings.index')}>
                            <ArrowLeft className="size-4" />
                            Back to clearings
                        </Link>
                    </Button>
                </div>

                <form
                    onSubmit={submit}
                    className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]"
                >
                    <div className="min-w-0 space-y-4">
                        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                            <div className="flex items-start gap-3 border-b border-border px-4 py-4 sm:px-5">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Banknote className="size-5" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold">
                                        Clearing details
                                    </h2>
                                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                        Select the presented cheque and branch,
                                        then enter the bank clearing reference.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-5 p-4 sm:grid-cols-2 sm:p-5">
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="cheque_id">
                                        Presented cheque
                                    </Label>
                                    <Select
                                        id="cheque_id"
                                        value={form.data.cheque_id}
                                        onChange={(value) =>
                                            form.setData('cheque_id', value)
                                        }
                                        placeholder={
                                            cheques.length
                                                ? 'Select presented cheque'
                                                : 'No presented cheques available'
                                        }
                                        options={[
                                            {
                                                value: '',
                                                label: cheques.length
                                                    ? 'Select presented cheque'
                                                    : 'No presented cheques available',
                                                disabled: cheques.length === 0,
                                            },
                                            ...cheques.map((cheque) => ({
                                                value: String(cheque.id),
                                                label: `${cheque.cheque_no} · ${formatBDTCurrency(cheque.amount, false)}`,
                                            })),
                                        ]}
                                    />
                                    {form.errors.cheque_id && (
                                        <p className="text-xs text-destructive">
                                            {form.errors.cheque_id}
                                        </p>
                                    )}
                                    {cheques.length === 0 && (
                                        <p className="text-xs text-muted-foreground">
                                            No presented cheques are currently
                                            available for clearing.
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="branch_id">Branch</Label>
                                    <Select
                                        id="branch_id"
                                        value={form.data.branch_id}
                                        onChange={(value) =>
                                            form.setData('branch_id', value)
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
                                    {form.errors.branch_id && (
                                        <p className="text-xs text-destructive">
                                            {form.errors.branch_id}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="clearing_no">
                                        Clearing number
                                    </Label>
                                    <Input
                                        id="clearing_no"
                                        value={form.data.clearing_no}
                                        onChange={(event) =>
                                            form.setData(
                                                'clearing_no',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="e.g. CLR-00001"
                                    />
                                    {form.errors.clearing_no && (
                                        <p className="text-xs text-destructive">
                                            {form.errors.clearing_no}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="drawer_bank_name">
                                        Drawer bank
                                    </Label>
                                    <Input
                                        id="drawer_bank_name"
                                        value={form.data.drawer_bank_name}
                                        onChange={(event) =>
                                            form.setData(
                                                'drawer_bank_name',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Bank name"
                                    />
                                    {form.errors.drawer_bank_name && (
                                        <p className="text-xs text-destructive">
                                            {form.errors.drawer_bank_name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="drawer_bank_branch">
                                        Bank branch
                                    </Label>
                                    <Input
                                        id="drawer_bank_branch"
                                        value={form.data.drawer_bank_branch}
                                        onChange={(event) =>
                                            form.setData(
                                                'drawer_bank_branch',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Branch name"
                                    />
                                    {form.errors.drawer_bank_branch && (
                                        <p className="text-xs text-destructive">
                                            {form.errors.drawer_bank_branch}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="drawer_account_no">
                                        Drawer account
                                    </Label>
                                    <Input
                                        id="drawer_account_no"
                                        value={form.data.drawer_account_no}
                                        onChange={(event) =>
                                            form.setData(
                                                'drawer_account_no',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Account number"
                                    />
                                    {form.errors.drawer_account_no && (
                                        <p className="text-xs text-destructive">
                                            {form.errors.drawer_account_no}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>

                        <div
                            data-slot="page-sticky-action-bar"
                            className="sticky bottom-0 flex flex-col-reverse gap-2 rounded-xl border border-border bg-background/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:justify-end"
                        >
                            <Button
                                asChild
                                variant="outline"
                                disabled={form.processing}
                            >
                                <Link href={route('cheque-clearings.index')}>
                                    Cancel
                                </Link>
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    form.processing ||
                                    !form.data.cheque_id ||
                                    !form.data.branch_id
                                }
                                className="gap-2"
                            >
                                {form.processing ? (
                                    <RefreshCw className="size-4 animate-spin" />
                                ) : (
                                    <Plus className="size-4" />
                                )}
                                {form.processing
                                    ? 'Creating...'
                                    : 'Create clearing'}
                            </Button>
                        </div>
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
                                            Cheque management
                                        </p>
                                        <h2 className="text-sm font-semibold">
                                            Clearing preview
                                        </h2>
                                    </div>
                                    <span className="rounded-full border border-primary/15 bg-background/80 px-2 py-1 text-[10px] font-semibold text-primary">
                                        LIVE
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3 p-3">
                                <div className="rounded-xl border border-primary/15 bg-primary/[0.06] p-3.5">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <CircleDollarSign className="size-4 text-primary" />
                                        Cheque amount
                                    </div>
                                    <p className="mt-1.5 text-2xl font-semibold tracking-tight text-primary tabular-nums">
                                        {formatBDTCurrency(
                                            selectedCheque?.amount ?? 0,
                                            false,
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                                    <div className="flex items-center gap-2 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                        <Banknote className="size-3.5" />
                                        Presented cheque
                                    </div>
                                    {selectedCheque ? (
                                        <div className="mt-2">
                                            <p className="font-mono text-sm font-semibold break-all">
                                                {selectedCheque.cheque_no}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {formatBDTCurrency(
                                                    selectedCheque.amount,
                                                    false,
                                                )}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            Select a presented cheque to preview
                                            it.
                                        </p>
                                    )}
                                </div>

                                {[
                                    {
                                        label: 'Branch',
                                        value: selectedBranch
                                            ? `${selectedBranch.name} (${selectedBranch.code})`
                                            : 'Not selected',
                                        icon: Building2,
                                    },
                                    {
                                        label: 'Clearing number',
                                        value:
                                            form.data.clearing_no ||
                                            'Not entered',
                                        icon: CalendarDays,
                                    },
                                    {
                                        label: 'Drawer bank',
                                        value:
                                            form.data.drawer_bank_name ||
                                            'Not entered',
                                        icon: Landmark,
                                    },
                                    {
                                        label: 'Bank branch',
                                        value:
                                            form.data.drawer_bank_branch ||
                                            'Not entered',
                                        icon: Building2,
                                    },
                                    {
                                        label: 'Drawer account',
                                        value:
                                            form.data.drawer_account_no ||
                                            'Not entered',
                                        icon: Landmark,
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

                                <p className="flex items-center gap-2 rounded-xl border border-primary/15 bg-primary/[0.04] px-3 py-2.5 text-xs text-muted-foreground">
                                    <CalendarDays className="size-4 shrink-0 text-primary" />
                                    Review clearing details before submission.
                                </p>
                            </div>
                        </section>
                    </aside>
                </form>

                {branches.length === 0 && (
                    <p className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-muted-foreground">
                        <Building2 className="size-4 shrink-0" />
                        There are no branches in the active organization.
                    </p>
                )}
            </div>
        </CustomAuthLayout>
    );
}
