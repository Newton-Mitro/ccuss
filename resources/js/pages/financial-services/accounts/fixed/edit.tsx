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
        fixed_deposit?: {
            principal_amount?: string | number;
            contractual_rate?: string | number;
            term_value?: number;
            term_unit?: string;
            started_at?: string;
            maturity_date?: string;
            maturity_instruction?: string;
        } | null;
        holder?: { name?: string } | null;
    };
}
export default function FixedDepositAccountEdit() {
    const { account, canManageProductDetails } = usePage<Props>().props;
    const deposit = account.fixed_deposit;
    const { data, setData, put, transform, processing, errors } = useForm({
        name: account.name ?? '',
        principal_amount: String(deposit?.principal_amount ?? ''),
        contractual_rate: String(deposit?.contractual_rate ?? ''),
        term_value: String(deposit?.term_value ?? ''),
        term_unit: deposit?.term_unit ?? 'MONTH',
        started_at: deposit?.started_at?.slice(0, 10) ?? '',
        maturity_instruction: deposit?.maturity_instruction ?? 'PAYOUT',
    });
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        {
            title: 'Fixed Deposits',
            href: route('financial-accounts.fixed.index'),
        },
        { title: account.account_no, href: '' },
    ];
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${account.account_no}`} />
            <div className="max-w-3xl space-y-4">
                <ResourcePageHeader
                    title="Edit fixed deposit account"
                    description={`${account.holder?.name ?? 'Depositor'} · maturity ${account.fixed_deposit?.maturity_date ?? '-'}`}
                />
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        const url = route(
                            'financial-accounts.fixed.update',
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
                                        account.account_type ?? 'FIXED_DEPOSIT'
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
                                    Principal amount
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.0001"
                                        value={data.principal_amount}
                                        onChange={(event) =>
                                            setData(
                                                'principal_amount',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.principal_amount}
                                    />
                                </Label>
                                <Label>
                                    Contractual annual rate (%)
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.000001"
                                        value={data.contractual_rate}
                                        onChange={(event) =>
                                            setData(
                                                'contractual_rate',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.contractual_rate}
                                    />
                                </Label>
                                <Label>
                                    Term
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            min="1"
                                            max="600"
                                            value={data.term_value}
                                            onChange={(event) =>
                                                setData(
                                                    'term_value',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <Select
                                            value={data.term_unit}
                                            onChange={(value) =>
                                                setData('term_unit', value)
                                            }
                                            options={[
                                                'DAY',
                                                'WEEK',
                                                'MONTH',
                                                'QUARTER',
                                                'YEAR',
                                            ].map((value) => ({
                                                value,
                                                label: value,
                                            }))}
                                        />
                                    </div>
                                    <InputError message={errors.term_value} />
                                    <InputError message={errors.term_unit} />
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
                                    Maturity instruction
                                    <Select
                                        value={data.maturity_instruction}
                                        onChange={(value) =>
                                            setData(
                                                'maturity_instruction',
                                                value,
                                            )
                                        }
                                        options={[
                                            ['PAYOUT', 'Pay out'],
                                            [
                                                'RENEW_PRINCIPAL',
                                                'Renew principal',
                                            ],
                                            [
                                                'RENEW_PRINCIPAL_AND_INTEREST',
                                                'Renew principal and interest',
                                            ],
                                        ].map(([value, label]) => ({
                                            value,
                                            label,
                                        }))}
                                    />
                                    <InputError
                                        message={errors.maturity_instruction}
                                    />
                                </Label>
                            </>
                        ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {canManageProductDetails
                            ? 'Maturity date is recalculated when contract terms change.'
                            : 'Contract terms require fixed-deposit management permission.'}{' '}
                        Product, depositor, account number, and balance remain
                        protected.
                    </p>
                    <div className="flex justify-end gap-2 border-t pt-4">
                        <Button asChild type="button" variant="outline">
                            <Link
                                href={route(
                                    'financial-accounts.fixed.show',
                                    account.id,
                                )}
                            >
                                Cancel
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Save deposit details
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
