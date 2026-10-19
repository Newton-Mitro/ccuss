import InputError from '@/components/input-error';
import { ResourcePageHeader } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import { formatDate } from '@/lib/date_util';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
interface Props extends SharedData {
    account: {
        id: number;
        account_no: string;
        account_type?: string;
        balance?: string | number;
        available_balance?: string | number;
        status?: string;
        name?: string;
        product?: { name?: string; code?: string } | null;
        holder?: { name?: string } | null;
        loan_account?: {
            loan_no?: string;
            principal_amount?: string | number;
            disbursed_amount?: string | number;
            contractual_rate?: string | number;
            interest_calculation?: string;
            term_value?: number;
            term_unit?: string;
            repayment_frequency?: string;
            interest_frequency?: string;
            grace_days?: number;
            late_payment_fine_rate?: string | number;
            approved_at?: string;
            disbursed_at?: string;
            maturity_date?: string;
            status?: string;
        } | null;
    };
}
export default function LoanAccountEdit() {
    const { account } = usePage<Props>().props;
    const { data, setData, put, processing, errors } = useForm({
        name: account.name ?? '',
    });
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        { title: 'Loan Accounts', href: route('loan-accounts.index') },
        {
            title: account.loan_account?.loan_no ?? account.account_no,
            href: '',
        },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head
                title={`Edit ${account.loan_account?.loan_no ?? account.account_no}`}
            />
            <div className="max-w-3xl space-y-4">
                <ResourcePageHeader
                    title="Edit loan account"
                    description={`${account.holder?.name ?? 'Borrower'} · approved loan contract`}
                />
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        put(route('loan-accounts.update', account.id));
                    }}
                    className="space-y-5 rounded-lg border bg-card p-5"
                >
                    <Label>
                        Account display name
                        <Input
                            value={data.name}
                            onChange={(event) =>
                                setData('name', event.target.value)
                            }
                        />
                    </Label>
                    <InputError message={errors.name} />
                    <section className="space-y-3 rounded-lg border bg-muted/20 p-4">
                        <h2 className="text-sm font-semibold">
                            Protected account and loan contract details
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Label>
                                Account number
                                <Input value={account.account_no} disabled />
                            </Label>
                            <Label>
                                Loan number
                                <Input
                                    value={
                                        account.loan_account?.loan_no ??
                                        account.account_no
                                    }
                                    disabled
                                />
                            </Label>
                            <Label>
                                Loan product
                                <Input
                                    value={
                                        [
                                            account.product?.code,
                                            account.product?.name,
                                        ]
                                            .filter(Boolean)
                                            .join(' - ') || '-'
                                    }
                                    disabled
                                />
                            </Label>
                            <Label>
                                Borrower
                                <Input
                                    value={account.holder?.name ?? '-'}
                                    disabled
                                />
                            </Label>
                            <Label>
                                Account type
                                <Input
                                    value={account.account_type ?? 'LOAN'}
                                    disabled
                                />
                            </Label>
                            <Label>
                                Account status
                                <Input value={account.status ?? '-'} disabled />
                            </Label>
                            <Label>
                                Loan status
                                <Input
                                    value={account.loan_account?.status ?? '-'}
                                    disabled
                                />
                            </Label>
                            <Label>
                                Account balance
                                <Input
                                    value={formatBDTCurrency(account.balance)}
                                    disabled
                                />
                            </Label>
                            <Label>
                                Available balance
                                <Input
                                    value={formatBDTCurrency(
                                        account.available_balance,
                                    )}
                                    disabled
                                />
                            </Label>
                            <Label>
                                Approved principal
                                <Input
                                    value={formatBDTCurrency(
                                        account.loan_account?.principal_amount,
                                    )}
                                    disabled
                                />
                            </Label>
                            <Label>
                                Disbursed amount
                                <Input
                                    value={formatBDTCurrency(
                                        account.loan_account?.disbursed_amount,
                                    )}
                                    disabled
                                />
                            </Label>
                            <Label>
                                Contractual rate
                                <Input
                                    value={`${account.loan_account?.contractual_rate ?? '0'}%`}
                                    disabled
                                />
                            </Label>
                            <Label>
                                Interest calculation
                                <Input
                                    value={
                                        account.loan_account
                                            ?.interest_calculation ?? '-'
                                    }
                                    disabled
                                />
                            </Label>
                            <Label>
                                Tenure
                                <Input
                                    value={
                                        account.loan_account?.term_value != null
                                            ? `${account.loan_account.term_value} ${account.loan_account.term_unit ?? ''}`
                                            : '-'
                                    }
                                    disabled
                                />
                            </Label>
                            <Label>
                                Repayment frequency
                                <Input
                                    value={
                                        account.loan_account
                                            ?.repayment_frequency ?? '-'
                                    }
                                    disabled
                                />
                            </Label>
                            <Label>
                                Interest frequency
                                <Input
                                    value={
                                        account.loan_account
                                            ?.interest_frequency ?? '-'
                                    }
                                    disabled
                                />
                            </Label>
                            <Label>
                                Grace days
                                <Input
                                    value={String(
                                        account.loan_account?.grace_days ?? 0,
                                    )}
                                    disabled
                                />
                            </Label>
                            <Label>
                                Late payment fine rate
                                <Input
                                    value={`${account.loan_account?.late_payment_fine_rate ?? '0'}%`}
                                    disabled
                                />
                            </Label>
                            <Label>
                                Approved date
                                <Input
                                    value={formatDate(
                                        account.loan_account?.approved_at,
                                    )}
                                    disabled
                                />
                            </Label>
                            <Label>
                                Disbursed date
                                <Input
                                    value={formatDate(
                                        account.loan_account?.disbursed_at,
                                    )}
                                    disabled
                                />
                            </Label>
                            <Label>
                                Maturity date
                                <Input
                                    value={formatDate(
                                        account.loan_account?.maturity_date,
                                    )}
                                    disabled
                                />
                            </Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Approved loan terms and disbursement details are
                            read-only here. Change them through the loan
                            application or a dedicated servicing workflow.
                        </p>
                    </section>
                    <div className="flex justify-end gap-2 border-t pt-4">
                        <Button asChild type="button" variant="outline">
                            <Link
                                href={route('loan-accounts.show', account.id)}
                            >
                                Cancel
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Save loan details
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
