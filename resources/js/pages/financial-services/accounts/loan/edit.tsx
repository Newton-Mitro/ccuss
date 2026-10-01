import InputError from '@/components/input-error';
import { ResourcePageHeader } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
interface Props extends SharedData {
    account: {
        id: number;
        account_no: string;
        name?: string;
        holder?: { name?: string } | null;
        loan_account?: {
            loan_no?: string;
            contractual_rate?: string | number;
            maturity_date?: string;
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
            <div className="max-w-2xl space-y-4">
                <ResourcePageHeader
                    title="Edit loan account"
                    description={`${account.holder?.name ?? 'Borrower'} · approved loan contract`}
                />
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        put(route('loan-accounts.update', account.id));
                    }}
                    className="space-y-4 rounded-lg border bg-card p-5"
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
                    <p className="text-sm text-muted-foreground">
                        Rate: {account.loan_account?.contractual_rate ?? '0'}% ·
                        Maturity: {account.loan_account?.maturity_date ?? '-'}
                    </p>
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
