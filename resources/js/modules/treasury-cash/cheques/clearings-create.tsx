import { ResourcePageHeader } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Banknote, Building2, Plus, RefreshCw } from 'lucide-react';
import type { FormEvent } from 'react';
import { route } from 'ziggy-js';
import type { Props } from '@/modules/treasury-cash/types/cheques/clearings-create.types';


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
            <div className="w-full max-w-4xl space-y-5 pb-24 text-foreground">
                <div className="flex flex-col gap-4 rounded-2xl border border-border bg-linear-to-r from-primary/10 via-card to-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <ResourcePageHeader
                        title="New cheque clearing"
                        description="Create a clearing record for a presented cheque."
                    />
                    <Button asChild variant="outline" className="gap-2">
                        <Link href={route('cheque-clearings.index')}>
                            <ArrowLeft className="size-4" />
                            Back to clearings
                        </Link>
                    </Button>
                </div>

                <form onSubmit={submit} className="space-y-4">
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
                                    Select the presented cheque and branch, then
                                    enter the bank clearing reference.
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

                    <div className="sticky bottom-0 flex flex-col-reverse gap-2 rounded-xl border border-border bg-background/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:justify-end">
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
