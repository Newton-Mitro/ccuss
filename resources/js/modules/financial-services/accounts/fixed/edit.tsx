import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { StatusBadge } from '@/components/resource-page-shell';
import AppDatePicker from '@/components/ui/app_date_picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { formatBDTCurrency } from '@/lib/bdtCurrencyFormatter';
import type { Props } from '@/modules/financial-services/types/accounts/fixed/edit.interfaces';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    FileText,
    Landmark,
    LockKeyhole,
    Save,
    ShieldCheck,
    Wallet,
} from 'lucide-react';
import { route } from 'ziggy-js';

const termUnits = [
    { value: 'DAY', label: 'Days' },
    { value: 'WEEK', label: 'Weeks' },
    { value: 'MONTH', label: 'Months' },
    { value: 'QUARTER', label: 'Quarters' },
    { value: 'YEAR', label: 'Years' },
];

const maturityInstructions = [
    { value: 'PAYOUT', label: 'Pay out at maturity' },
    { value: 'RENEW_PRINCIPAL', label: 'Renew principal only' },
    {
        value: 'RENEW_PRINCIPAL_AND_INTEREST',
        label: 'Renew principal and interest',
    },
];

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="min-w-0 space-y-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-medium break-words">{value}</p>
        </div>
    );
}

function FormField({
    label,
    error,
    hint,
    required,
    children,
}: {
    label: string;
    error?: string;
    hint?: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className="min-w-0 space-y-1.5">
            <Label className="text-sm">
                {label}
                {required && <span className="ml-1 text-destructive">*</span>}
            </Label>
            {children}
            {error ? (
                <InputError message={error} />
            ) : hint ? (
                <p className="text-xs leading-relaxed text-muted-foreground">
                    {hint}
                </p>
            ) : null}
        </div>
    );
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

    const productName =
        [account.product?.code, account.product?.name]
            .filter(Boolean)
            .join(' - ') || '—';

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const url = route('financial-accounts.fixed.update', account.id);

        if (canManageProductDetails) {
            put(url, {
                preserveScroll: true,
            });
            return;
        }

        transform(() => ({
            name: data.name,
        }));

        put(url, {
            preserveScroll: true,
            onFinish: () => {
                transform((formData) => formData);
            },
        });
    };

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${account.account_no}`} />

            <div className="max-w-4xl space-y-5 pb-8">
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <HeadingSmall
                        title="Edit fixed deposit account"
                        description={`${account.holder?.name ?? 'Depositor'} · Account ${account.account_no}`}
                    />
                </div>

                {/* Account overview */}
                <section className="overflow-hidden rounded-xl border bg-card">
                    <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Landmark className="size-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">
                                    Fixed deposit account
                                </p>
                                <h2 className="mt-0.5 truncate font-semibold">
                                    {account.account_no}
                                </h2>
                                <p className="mt-1 truncate text-xs text-muted-foreground">
                                    {productName}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge
                                tone={
                                    account.status === 'ACTIVE'
                                        ? 'success'
                                        : 'neutral'
                                }
                            >
                                {account.status ?? 'Unknown'}
                            </StatusBadge>
                            <StatusBadge tone="neutral">
                                {canManageProductDetails
                                    ? 'Contract access'
                                    : 'Limited access'}
                            </StatusBadge>
                        </div>
                    </div>

                    <div className="grid gap-x-6 gap-y-5 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
                        <DetailItem
                            label="Account holder"
                            value={account.holder?.name ?? 'Unassigned'}
                        />
                        <DetailItem label="Product" value={productName} />
                        <DetailItem
                            label="Account type"
                            value={account.account_type ?? 'FIXED_DEPOSIT'}
                        />
                        <DetailItem
                            label="Principal amount"
                            value={formatBDTCurrency(
                                deposit?.principal_amount ?? 0,
                                false,
                            )}
                        />
                        <DetailItem
                            label="Maturity date"
                            value={
                                deposit?.maturity_date
                                    ? deposit.maturity_date.slice(0, 10)
                                    : 'Not available'
                            }
                        />
                        <DetailItem
                            label="Account balance"
                            value={formatBDTCurrency(
                                account.balance ?? 0,
                                false,
                            )}
                        />
                    </div>
                </section>

                <form
                    onSubmit={submit}
                    className="overflow-hidden rounded-xl border bg-card"
                >
                    <div className="space-y-6 p-4 sm:p-6">
                        {/* Account name */}
                        <section className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <FileText className="size-4" />
                                </div>
                                <div className="pt-0.5">
                                    <h2 className="text-sm font-semibold">
                                        Account information
                                    </h2>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Update the internal display name for
                                        this account.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    label="Account display name"
                                    error={errors.name}
                                    hint="Optional name used to identify the account."
                                >
                                    <Input
                                        value={data.name}
                                        onChange={(event) =>
                                            setData('name', event.target.value)
                                        }
                                        placeholder="Enter account display name"
                                        autoComplete="off"
                                    />
                                </FormField>
                            </div>
                        </section>

                        {/* Contract terms */}
                        {canManageProductDetails ? (
                            <>
                                <div className="border-t" />

                                <section className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <Wallet className="size-4" />
                                        </div>
                                        <div className="pt-0.5">
                                            <h2 className="text-sm font-semibold">
                                                Contract terms
                                            </h2>
                                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                                Changes may affect the maturity
                                                date and interest calculation.
                                                Verify the agreed terms before
                                                saving.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <FormField
                                            label="Principal amount (৳)"
                                            required
                                            error={errors.principal_amount}
                                        >
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
                                                placeholder="0.00"
                                                inputMode="decimal"
                                            />
                                        </FormField>

                                        <FormField
                                            label="Contractual annual rate (%)"
                                            required
                                            error={errors.contractual_rate}
                                            hint="The agreed annual interest rate."
                                        >
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
                                                placeholder="e.g. 8.50"
                                                inputMode="decimal"
                                            />
                                        </FormField>

                                        <FormField
                                            label="Term duration"
                                            required
                                            error={
                                                errors.term_value ||
                                                errors.term_unit
                                            }
                                            hint="Specify the contract duration and unit."
                                        >
                                            <div className="grid grid-cols-[minmax(0,1fr)_minmax(110px,0.8fr)] gap-2">
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={data.term_value}
                                                    onChange={(event) =>
                                                        setData(
                                                            'term_value',
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="Duration"
                                                />
                                                <Select
                                                    value={data.term_unit}
                                                    onChange={(value) =>
                                                        setData(
                                                            'term_unit',
                                                            value,
                                                        )
                                                    }
                                                    options={termUnits}
                                                />
                                            </div>
                                            {errors.term_value && (
                                                <InputError
                                                    message={errors.term_value}
                                                />
                                            )}
                                            {errors.term_unit && (
                                                <InputError
                                                    message={errors.term_unit}
                                                />
                                            )}
                                        </FormField>

                                        <FormField
                                            label="Start date"
                                            required
                                            error={errors.started_at}
                                        >
                                            <AppDatePicker
                                                value={data.started_at}
                                                onChange={(value) =>
                                                    setData('started_at', value)
                                                }
                                            />
                                        </FormField>

                                        <FormField
                                            label="Maturity instruction"
                                            required
                                            error={errors.maturity_instruction}
                                            hint="Defines how the deposit is handled at maturity."
                                        >
                                            <Select
                                                value={
                                                    data.maturity_instruction
                                                }
                                                onChange={(value) =>
                                                    setData(
                                                        'maturity_instruction',
                                                        value,
                                                    )
                                                }
                                                options={maturityInstructions}
                                            />
                                        </FormField>
                                    </div>
                                </section>
                            </>
                        ) : (
                            <>
                                <div className="border-t" />

                                <div className="flex items-start gap-3 rounded-lg border bg-muted/20 p-4">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground">
                                        <LockKeyhole className="size-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-medium">
                                            Contract terms are protected
                                        </h3>
                                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                            Fixed deposit management permission
                                            is required to change the principal,
                                            interest rate, tenure, start date,
                                            or maturity instruction. You can
                                            still update the account display
                                            name.
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Protected fields */}
                        <div className="border-t" />

                        <section className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                    <ShieldCheck className="size-4" />
                                </div>
                                <div className="pt-0.5">
                                    <h2 className="text-sm font-semibold">
                                        Protected account details
                                    </h2>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        These values cannot be changed from this
                                        form.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField label="Account number">
                                    <Input
                                        value={account.account_no}
                                        disabled
                                    />
                                </FormField>

                                <FormField label="Deposit product">
                                    <Input value={productName} disabled />
                                </FormField>

                                <FormField label="Depositor">
                                    <Input
                                        value={
                                            account.holder?.name ?? 'Unassigned'
                                        }
                                        disabled
                                    />
                                </FormField>

                                <FormField label="Account type">
                                    <Input
                                        value={
                                            account.account_type ??
                                            'FIXED_DEPOSIT'
                                        }
                                        disabled
                                    />
                                </FormField>

                                <FormField label="Current balance">
                                    <Input
                                        value={formatBDTCurrency(
                                            account.balance ?? 0,
                                            false,
                                        )}
                                        disabled
                                    />
                                </FormField>

                                <FormField label="Account status">
                                    <Input
                                        value={account.status ?? 'Unknown'}
                                        disabled
                                    />
                                </FormField>
                            </div>
                        </section>

                        <div className="flex items-start gap-2 rounded-lg border bg-muted/20 p-3">
                            <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                {canManageProductDetails
                                    ? 'The maturity date may be recalculated when contract terms change. Confirm your backend recalculation rules and any applicable approval requirements.'
                                    : 'Only the display name can be updated with your current permissions.'}
                            </p>
                        </div>
                    </div>

                    {/* Sticky form actions */}
                    <div className="sticky bottom-0 z-10 flex flex-col-reverse gap-2 border-t bg-card/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-card/85 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <Button asChild type="button" variant="outline">
                            <Link
                                href={route(
                                    'financial-accounts.fixed.show',
                                    account.id,
                                )}
                            >
                                <ArrowLeft className="mr-2 size-4" />
                                Cancel
                            </Link>
                        </Button>

                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 size-4" />
                            {processing
                                ? 'Saving changes...'
                                : 'Save deposit details'}
                        </Button>
                    </div>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
