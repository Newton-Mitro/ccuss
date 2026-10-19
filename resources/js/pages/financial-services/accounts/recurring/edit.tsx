import InputError from '@/components/input-error';
import { ResourcePageHeader } from '@/components/resource-page-shell';
import AppDatePicker from '@/components/ui/app_date_picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
interface Props extends SharedData {
    canManageProductDetails: boolean;
    account: {
        id: number;
        account_no: string;
        account_type?: string;
        balance?: string | number;
        status?: string;
        name?: string;
        product?: { code?: string; name?: string } | null;
        recurring_deposit?: {
            installment_amount?: string | number;
            installment_frequency?: string;
            total_installments?: number;
            started_at?: string;
            maturity_extension_days?: number;
            grace_days?: number;
            maturity_date?: string;
        } | null;
        holder?: { name?: string } | null;
    };
}
export default function RecurringDepositAccountEdit() {
    const { account, canManageProductDetails } = usePage<Props>().props;
    const deposit = account.recurring_deposit;
    const { data, setData, put, transform, processing, errors } = useForm({
        name: account.name ?? '',
        installment_amount: String(deposit?.installment_amount ?? ''),
        installment_frequency: deposit?.installment_frequency ?? 'MONTHLY',
        total_installments: String(deposit?.total_installments ?? ''),
        started_at: deposit?.started_at?.slice(0, 10) ?? '',
        maturity_extension_days: String(deposit?.maturity_extension_days ?? 0),
        grace_days: String(deposit?.grace_days ?? 0),
    });
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        {
            title: 'Recurring Deposits',
            href: route('financial-accounts.recurring.index'),
        },
        { title: account.account_no, href: '' },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${account.account_no}`} />
            <div className="max-w-3xl space-y-4">
                <ResourcePageHeader
                    title="Edit recurring deposit account"
                    description={`${account.holder?.name ?? 'Depositor'} · ${account.recurring_deposit?.installment_frequency ?? 'Installment'} schedule`}
                />
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        const url = route(
                            'financial-accounts.recurring.update',
                            account.id,
                        );
                        if (canManageProductDetails) {
                            put(url);
                        } else {
                            transform((formData) => ({
                                name: formData.name,
                            })).put(url);
                        }
                    }}
                    className="space-y-5 rounded-lg border bg-card p-5"
                >
                    <section className="space-y-3 rounded-lg border bg-muted/20 p-4">
                        <h2 className="text-sm font-semibold">
                            Protected account details
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Label>
                                Account number
                                <Input value={account.account_no} disabled />
                            </Label>
                            <Label>
                                Product
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
                                Depositor
                                <Input
                                    value={account.holder?.name ?? '-'}
                                    disabled
                                />
                            </Label>
                            <Label>
                                Account type
                                <Input
                                    value={
                                        account.account_type ??
                                        'RECURRING_DEPOSIT'
                                    }
                                    disabled
                                />
                            </Label>
                            <Label>
                                Balance
                                <Input
                                    value={formatBDTCurrency(account.balance)}
                                    disabled
                                />
                            </Label>
                            <Label>
                                Account status
                                <Input value={account.status ?? '-'} disabled />
                            </Label>
                        </div>
                    </section>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Label>
                            Account display name
                            <Input
                                value={data.name}
                                onChange={(event) =>
                                    setData('name', event.target.value)
                                }
                            />
                            <InputError message={errors.name} />
                        </Label>
                        {canManageProductDetails ? (
                            <>
                                <Label>
                                    Installment amount
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.0001"
                                        value={data.installment_amount}
                                        onChange={(event) =>
                                            setData(
                                                'installment_amount',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.installment_amount}
                                    />
                                </Label>
                                <Label>
                                    Frequency
                                    <Select
                                        value={data.installment_frequency}
                                        onChange={(value) =>
                                            setData(
                                                'installment_frequency',
                                                value,
                                            )
                                        }
                                        options={[
                                            'WEEKLY',
                                            'MONTHLY',
                                            'QUARTERLY',
                                        ].map((value) => ({
                                            value,
                                            label: value,
                                        }))}
                                    />
                                    <InputError
                                        message={errors.installment_frequency}
                                    />
                                </Label>
                                <Label>
                                    Total installments
                                    <Input
                                        type="number"
                                        min="1"
                                        max="600"
                                        value={data.total_installments}
                                        onChange={(event) =>
                                            setData(
                                                'total_installments',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.total_installments}
                                    />
                                </Label>
                                <Label>
                                    Start date
                                    <AppDatePicker
                                        value={data.started_at}
                                        onChange={(value) =>
                                            setData('started_at', value)
                                        }
                                    />
                                    <InputError message={errors.started_at} />
                                </Label>
                                <Label>
                                    Grace days
                                    <Input
                                        type="number"
                                        min="0"
                                        value={data.grace_days}
                                        onChange={(event) =>
                                            setData(
                                                'grace_days',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError message={errors.grace_days} />
                                </Label>
                                <Label>
                                    Maturity extension days
                                    <Input
                                        type="number"
                                        min="0"
                                        value={data.maturity_extension_days}
                                        onChange={(event) =>
                                            setData(
                                                'maturity_extension_days',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.maturity_extension_days}
                                    />
                                </Label>
                            </>
                        ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {canManageProductDetails
                            ? 'Maturity date and pending installment schedule are recalculated when terms change.'
                            : 'Contract terms require recurring-deposit management permission.'}{' '}
                        Product, depositor, account number, and balance remain
                        protected.
                    </p>
                    <div className="flex justify-end gap-2 border-t pt-4">
                        <Button asChild type="button" variant="outline">
                            <Link
                                href={route(
                                    'financial-accounts.recurring.show',
                                    account.id,
                                )}
                            >
                                Cancel
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Save recurring details
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
