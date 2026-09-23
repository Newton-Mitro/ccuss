import { ResourcePageHeader } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import type { FinancialTransactionWorkflowPageProps } from '@/types/financial-services';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowRightLeft, CircleDollarSign } from 'lucide-react';
import { route } from 'ziggy-js';

const details: Record<
    string,
    { title: string; description: string; icon: typeof ArrowRightLeft }
> = {
    transfer: {
        title: 'Account transfer',
        description:
            'Move value between two financial accounts with a balanced operational entry.',
        icon: ArrowRightLeft,
    },
    'loan-disbursement': {
        title: 'Loan disbursement',
        description:
            'Prepare a controlled disbursement against an approved loan account.',
        icon: CircleDollarSign,
    },
    'loan-repayment': {
        title: 'Loan repayment',
        description:
            'Collect and allocate a repayment across the scheduled loan components.',
        icon: CircleDollarSign,
    },
    'fine-payment': {
        title: 'Fine payment',
        description:
            'Collect an assessed account fine through a financial transaction.',
        icon: CircleDollarSign,
    },
};
export default function TransactionWorkflow() {
    const {
        workflow,
        accounts = [],
        loan_accounts = [],
        payout_accounts = [],
        fines = [],
    } = usePage<FinancialTransactionWorkflowPageProps>().props;
    const detail = details[workflow] ?? details.transfer;
    const Icon = detail.icon;
    const { data, setData, post, processing, errors } = useForm({
        idempotency_key: crypto.randomUUID(),
        source_account_id: '',
        destination_account_id: '',
        transaction_date: new Date().toISOString().slice(0, 10),
        amount: '',
        currency: 'BDT',
        reference: '',
        description: '',
        loan_account_id: '',
        payout_account_id: '',
        disbursed_at: new Date().toISOString().slice(0, 10),
        repayment_date: new Date().toISOString().slice(0, 10),
        account_fine_id: '',
        payment_date: new Date().toISOString().slice(0, 10),
        note: '',
    });
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        { title: 'Transactions', href: route('financial-transactions.index') },
        { title: detail.title, href: '' },
    ];

    const submitTransfer = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(route('financial-transactions.transfer.store'));
    };

    const submitLoanDisbursement = (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();
        post(route('financial-transactions.loan-disbursement.store'));
    };

    const submitLoanRepayment = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(route('financial-transactions.loan-repayment.store'));
    };

    const submitFinePayment = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(route('financial-transactions.fine-payment.store'));
    };

    if (workflow === 'transfer') {
        return (
            <CustomAuthLayout breadcrumbs={breadcrumbs}>
                <Head title={detail.title} />
                <div className="max-w-3xl space-y-4">
                    <ResourcePageHeader
                        title={detail.title}
                        description={detail.description}
                    />
                    <form
                        onSubmit={submitTransfer}
                        className="space-y-4 rounded-xl border bg-card p-4 shadow-sm"
                    >
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <Label>Source account</Label>
                                <Select
                                    value={data.source_account_id}
                                    onChange={(value) =>
                                        setData('source_account_id', value)
                                    }
                                    options={[
                                        {
                                            value: '',
                                            label: 'Select source account',
                                        },
                                        ...accounts.map((account) => ({
                                            value: String(account.id),
                                            label: `${account.account_no} - ${account.name ?? account.account_type}`,
                                        })),
                                    ]}
                                />
                                {errors.source_account_id && (
                                    <p className="mt-1 text-sm text-destructive">
                                        {errors.source_account_id}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label>Destination account</Label>
                                <Select
                                    value={data.destination_account_id}
                                    onChange={(value) =>
                                        setData('destination_account_id', value)
                                    }
                                    options={[
                                        {
                                            value: '',
                                            label: 'Select destination account',
                                        },
                                        ...accounts.map((account) => ({
                                            value: String(account.id),
                                            label: `${account.account_no} - ${account.name ?? account.account_type}`,
                                        })),
                                    ]}
                                />
                                {errors.destination_account_id && (
                                    <p className="mt-1 text-sm text-destructive">
                                        {errors.destination_account_id}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label>Date</Label>
                                <Input
                                    type="date"
                                    value={data.transaction_date}
                                    onChange={(event) =>
                                        setData(
                                            'transaction_date',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <Label>Amount</Label>
                                <Input
                                    type="number"
                                    min="0.0001"
                                    step="0.0001"
                                    value={data.amount}
                                    onChange={(event) =>
                                        setData('amount', event.target.value)
                                    }
                                />
                                {errors.amount && (
                                    <p className="mt-1 text-sm text-destructive">
                                        {errors.amount}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label>Reference</Label>
                                <Input
                                    value={data.reference}
                                    onChange={(event) =>
                                        setData('reference', event.target.value)
                                    }
                                    placeholder="Optional reference"
                                />
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Input
                                    value={data.description}
                                    onChange={(event) =>
                                        setData(
                                            'description',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Optional description"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 border-t pt-3">
                            <Button asChild type="button" variant="outline">
                                <Link
                                    href={route('financial-transactions.index')}
                                >
                                    Cancel
                                </Link>
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing || accounts.length < 2}
                            >
                                Create transfer draft
                            </Button>
                        </div>
                    </form>
                </div>
            </CustomAuthLayout>
        );
    }

    if (workflow === 'loan-disbursement' || workflow === 'loan-repayment') {
        return (
            <CustomAuthLayout breadcrumbs={breadcrumbs}>
                <Head title={detail.title} />
                <div className="max-w-3xl space-y-4">
                    <ResourcePageHeader
                        title={detail.title}
                        description={detail.description}
                    />
                    <form
                        onSubmit={
                            workflow === 'loan-disbursement'
                                ? submitLoanDisbursement
                                : submitLoanRepayment
                        }
                        className="space-y-4 rounded-xl border bg-card p-4 shadow-sm"
                    >
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <Label>Loan account</Label>
                                <Select
                                    value={data.loan_account_id}
                                    onChange={(value) =>
                                        setData('loan_account_id', value)
                                    }
                                    options={[
                                        {
                                            value: '',
                                            label:
                                                workflow === 'loan-disbursement'
                                                    ? 'Select approved loan'
                                                    : 'Select active loan',
                                        },
                                        ...loan_accounts.map((loan) => ({
                                            value: String(loan.id),
                                            label: `${loan.loan_no} - ${loan.customer?.name ?? 'Customer'} (Remaining ${Number(loan.principal_amount) - Number(loan.disbursed_amount)})`,
                                        })),
                                    ]}
                                />
                                {errors.loan_account_id && (
                                    <p className="mt-1 text-sm text-destructive">
                                        {errors.loan_account_id}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label>Payout account</Label>
                                <Select
                                    value={data.payout_account_id}
                                    onChange={(value) =>
                                        setData('payout_account_id', value)
                                    }
                                    options={[
                                        {
                                            value: '',
                                            label: 'Select cash or bank account',
                                        },
                                        ...payout_accounts.map((account) => ({
                                            value: String(account.id),
                                            label: `${account.account_no} - ${account.name ?? account.account_type}`,
                                        })),
                                    ]}
                                />
                                {errors.payout_account_id && (
                                    <p className="mt-1 text-sm text-destructive">
                                        {errors.payout_account_id}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label>Amount</Label>
                                <Input
                                    type="number"
                                    min="0.0001"
                                    step="0.0001"
                                    value={data.amount}
                                    onChange={(event) =>
                                        setData('amount', event.target.value)
                                    }
                                />
                                {errors.amount && (
                                    <p className="mt-1 text-sm text-destructive">
                                        {errors.amount}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label>
                                    {workflow === 'loan-disbursement'
                                        ? 'Disbursement date'
                                        : 'Repayment date'}
                                </Label>
                                <Input
                                    type="date"
                                    value={
                                        workflow === 'loan-disbursement'
                                            ? data.disbursed_at
                                            : data.repayment_date
                                    }
                                    onChange={(event) =>
                                        setData(
                                            workflow === 'loan-disbursement'
                                                ? 'disbursed_at'
                                                : 'repayment_date',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <Label>Reference</Label>
                                <Input
                                    value={data.reference}
                                    onChange={(event) =>
                                        setData('reference', event.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <Label>
                                    {workflow === 'loan-disbursement'
                                        ? 'Note'
                                        : 'Reference'}
                                </Label>
                                <Input
                                    value={
                                        workflow === 'loan-disbursement'
                                            ? data.note
                                            : data.reference
                                    }
                                    onChange={(event) =>
                                        setData(
                                            workflow === 'loan-disbursement'
                                                ? 'note'
                                                : 'reference',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 border-t pt-3">
                            <Button asChild type="button" variant="outline">
                                <Link
                                    href={route('financial-transactions.index')}
                                >
                                    Cancel
                                </Link>
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    processing ||
                                    loan_accounts.length === 0 ||
                                    payout_accounts.length === 0
                                }
                            >
                                {workflow === 'loan-disbursement'
                                    ? 'Create disbursement draft'
                                    : 'Create repayment draft'}
                            </Button>
                        </div>
                    </form>
                </div>
            </CustomAuthLayout>
        );
    }

    if (workflow === 'fine-payment') {
        return (
            <CustomAuthLayout breadcrumbs={breadcrumbs}>
                <Head title={detail.title} />
                <div className="max-w-3xl space-y-4">
                    <ResourcePageHeader
                        title={detail.title}
                        description={detail.description}
                    />
                    <form
                        onSubmit={submitFinePayment}
                        className="space-y-4 rounded-xl border bg-card p-4 shadow-sm"
                    >
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <Label>Fine</Label>
                                <Select
                                    value={data.account_fine_id}
                                    onChange={(value) =>
                                        setData('account_fine_id', value)
                                    }
                                    options={[
                                        {
                                            value: '',
                                            label: 'Select assessed fine',
                                        },
                                        ...fines.map((fine) => ({
                                            value: String(fine.id),
                                            label: `#${fine.id} · ${fine.financial_account?.account_no ?? 'Account'} · Outstanding ${Number(fine.assessed_amount) - Number(fine.paid_amount) - Number(fine.waived_amount)}`,
                                        })),
                                    ]}
                                />
                            </div>
                            <div>
                                <Label>Amount</Label>
                                <Input
                                    type="number"
                                    min="0.0001"
                                    step="0.0001"
                                    value={data.amount}
                                    onChange={(event) =>
                                        setData('amount', event.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <Label>Payment date</Label>
                                <Input
                                    type="date"
                                    value={data.payment_date}
                                    onChange={(event) =>
                                        setData(
                                            'payment_date',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <Label>Reference</Label>
                                <Input
                                    value={data.reference}
                                    onChange={(event) =>
                                        setData('reference', event.target.value)
                                    }
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={processing}>
                                Create fine payment draft
                            </Button>
                        </div>
                    </form>
                </div>
            </CustomAuthLayout>
        );
    }

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={detail.title} />
            <div className="max-w-2xl space-y-5">
                <ResourcePageHeader
                    title={detail.title}
                    description={detail.description}
                />
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center shadow-sm">
                    <Icon className="mx-auto h-10 w-10 text-primary" />
                    <h2 className="mt-4 text-lg font-semibold">
                        Workflow ready for configuration
                    </h2>
                    <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                        This screen is reserved for the policy-aware workflow.
                        It will validate accounts, product rules, and accounting
                        mappings before posting.
                    </p>
                    <Button asChild className="mt-6">
                        <Link href={route('financial-transactions.index')}>
                            Back to transactions
                        </Link>
                    </Button>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
