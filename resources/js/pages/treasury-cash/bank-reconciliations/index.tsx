import {
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

type Reconciliation = {
    id: number;
    statement_date: string;
    statement_balance: string | number;
    book_balance: string | number;
    difference: string | number;
    status: string;
    bank_account?: { account_name?: string; account_number?: string };
};
type Props = {
    reconciliations: { data: Reconciliation[] };
    accounts: { id: number; account_name: string; account_number: string }[];
};

export default function BankReconciliationsIndex() {
    const { reconciliations, accounts } = usePage<Props>().props;
    const { data, setData, post, processing } = useForm({
        bank_account_id: '',
        statement_date: new Date().toISOString().slice(0, 10),
        statement_balance: '',
    });
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: route('treasury-cash.dashboard') },
        {
            title: 'Bank Reconciliations',
            href: route('bank-reconciliations.index'),
        },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Bank Reconciliations" />
            <div className="space-y-4">
                <ResourcePageHeader
                    title="Bank Reconciliations"
                    description="Compare bank statement balances with posted book balances and finalize matched sessions."
                />
                <section className="rounded-lg border bg-card p-4">
                    <form
                        className="flex flex-wrap items-end gap-3"
                        onSubmit={(event) => {
                            event.preventDefault();
                            post(route('bank-reconciliations.store'));
                        }}
                    >
                        <div>
                            <Label>Bank account</Label>
                            <select
                                className="h-9 rounded-md border bg-background px-3 text-sm"
                                value={data.bank_account_id}
                                onChange={(event) =>
                                    setData(
                                        'bank_account_id',
                                        event.target.value,
                                    )
                                }
                            >
                                <option value="">Select account</option>
                                {accounts.map((account) => (
                                    <option key={account.id} value={account.id}>
                                        {account.account_name} ·{' '}
                                        {account.account_number}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label>Statement date</Label>
                            <Input
                                type="date"
                                value={data.statement_date}
                                onChange={(event) =>
                                    setData(
                                        'statement_date',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                        <div>
                            <Label>Statement balance</Label>
                            <Input
                                type="number"
                                step="0.0001"
                                value={data.statement_balance}
                                onChange={(event) =>
                                    setData(
                                        'statement_balance',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                        <Button type="submit" disabled={processing}>
                            Save reconciliation
                        </Button>
                    </form>
                </section>
                <section className="rounded-lg border bg-card">
                    <div className="divide-y">
                        {reconciliations.data.map((reconciliation) => (
                            <div
                                key={reconciliation.id}
                                className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm"
                            >
                                <div>
                                    <p className="font-medium">
                                        {reconciliation.bank_account
                                            ?.account_name ?? '-'}{' '}
                                        · {reconciliation.statement_date}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Statement{' '}
                                        {reconciliation.statement_balance} ·
                                        Book {reconciliation.book_balance} ·
                                        Difference {reconciliation.difference}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <StatusBadge
                                        tone={
                                            reconciliation.status ===
                                            'RECONCILED'
                                                ? 'success'
                                                : 'neutral'
                                        }
                                    >
                                        {reconciliation.status}
                                    </StatusBadge>
                                    {reconciliation.status === 'OPEN' &&
                                        Number(reconciliation.difference) ===
                                            0 && (
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    router.post(
                                                        route(
                                                            'bank-reconciliations.finalize',
                                                            reconciliation.id,
                                                        ),
                                                    )
                                                }
                                            >
                                                Finalize
                                            </Button>
                                        )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </CustomAuthLayout>
    );
}
