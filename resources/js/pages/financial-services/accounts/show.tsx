import InputError from '@/components/input-error';
import {
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem } from '@/types';
import type { FinancialAccountShowPageProps } from '@/types/financial-services';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Check, Lock, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

export default function FinancialAccountShow() {
    const { account, customers } =
        usePage<FinancialAccountShowPageProps>().props;
    const [editingNomineeId, setEditingNomineeId] = useState<number | null>(
        null,
    );
    const [editingHolderId, setEditingHolderId] = useState<number | null>(null);
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        relationship: '',
        phone: '',
        identification_type: '',
        identification_number: '',
        share_percent: '100',
        is_primary: true,
    });
    const {
        data: holderData,
        setData: setHolderData,
        post: postHolder,
        put: putHolder,
        processing: holderProcessing,
        errors: holderErrors,
        reset: resetHolder,
    } = useForm({
        customer_id: '',
        role: 'JOINT',
        ownership_percent: '50',
        guardian_customer_id: '',
    });
    const {
        data: membershipData,
        setData: setMembershipData,
        post: postMembership,
        put: putMembership,
        processing: membershipProcessing,
        errors: membershipErrors,
    } = useForm({
        membership_no: account.share_account?.membership_no ?? '',
        member_since: account.share_account?.member_since ?? '',
        membership_status:
            account.share_account?.membership_status ?? 'PENDING',
    });
    const {
        data: fixedData,
        setData: setFixedData,
        post: postFixedDeposit,
        processing: fixedProcessing,
        errors: fixedErrors,
    } = useForm({
        principal_amount: '',
        contractual_rate: '',
        term_months: '12',
        started_at: new Date().toISOString().slice(0, 10),
        maturity_instruction: 'PAYOUT',
    });
    const {
        data: recurringData,
        setData: setRecurringData,
        post: postRecurringDeposit,
        processing: recurringProcessing,
        errors: recurringErrors,
    } = useForm({
        installment_amount: '',
        installment_frequency: 'MONTHLY',
        total_installments: '12',
        started_at: new Date().toISOString().slice(0, 10),
        maturity_extension_days: '0',
        grace_days: '0',
    });
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Services', href: '' },
        {
            title: 'Financial Accounts',
            href: route('financial-accounts.index'),
        },
        { title: account.account_no, href: '' },
    ];

    const submitNominee = (event: React.FormEvent) => {
        event.preventDefault();
        const options = {
            onSuccess: () => {
                reset();
                setEditingNomineeId(null);
            },
        };
        if (editingNomineeId) {
            put(
                route('financial-accounts.nominees.update', [
                    account.id,
                    editingNomineeId,
                ]),
                options,
            );
        } else {
            post(
                route('financial-accounts.nominees.store', account.id),
                options,
            );
        }
    };

    const editNominee = (
        nominee: NonNullable<typeof account.nominees>[number],
    ) => {
        setEditingNomineeId(nominee.id);
        setData({
            name: nominee.name,
            relationship: nominee.relationship,
            phone: nominee.phone ?? '',
            identification_type: nominee.identification_type ?? '',
            identification_number: nominee.identification_number ?? '',
            share_percent: String(nominee.share_percent ?? 0),
            is_primary: nominee.is_primary ?? false,
        });
    };

    const submitHolder = (event: React.FormEvent) => {
        event.preventDefault();
        const options = {
            onSuccess: () => {
                resetHolder();
                setEditingHolderId(null);
            },
        };
        if (editingHolderId) {
            putHolder(
                route('financial-accounts.holders.update', [
                    account.id,
                    editingHolderId,
                ]),
                options,
            );
        } else {
            postHolder(
                route('financial-accounts.holders.store', account.id),
                options,
            );
        }
    };

    const editHolder = (
        holder: NonNullable<typeof account.holders>[number],
    ) => {
        setEditingHolderId(holder.id);
        setHolderData({
            customer_id: String(holder.id),
            role: holder.pivot?.role ?? 'JOINT',
            ownership_percent: String(holder.pivot?.ownership_percent ?? 0),
            guardian_customer_id: holder.pivot?.guardian_customer_id
                ? String(holder.pivot.guardian_customer_id)
                : '',
        });
    };

    const submitMembership = (event: React.FormEvent) => {
        event.preventDefault();
        const options = { preserveScroll: true };
        if (account.share_account) {
            putMembership(
                route('financial-accounts.membership.update', [
                    account.id,
                    account.share_account.id,
                ]),
                options,
            );
        } else {
            postMembership(
                route('financial-accounts.membership.store', account.id),
                options,
            );
        }
    };

    const submitFixedDeposit = (event: React.FormEvent) => {
        event.preventDefault();
        postFixedDeposit(
            route('financial-accounts.fixed-deposit.store', account.id),
            { preserveScroll: true },
        );
    };

    const submitRecurringDeposit = (event: React.FormEvent) => {
        event.preventDefault();
        postRecurringDeposit(
            route('financial-accounts.recurring-deposit.store', account.id),
            { preserveScroll: true },
        );
    };
    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={account.account_no} />
            <div className="space-y-4">
                <ResourcePageHeader
                    title={account.account_no}
                    description={`${account.holder?.name ?? account.name ?? 'Unassigned'} · ${account.product?.name ?? account.account_type}`}
                    action={
                        <div className="flex gap-2">
                            {account.status === 'PENDING' && (
                                <Button
                                    size="sm"
                                    onClick={() =>
                                        router.post(
                                            route(
                                                'financial-accounts.activate',
                                                account.id,
                                            ),
                                        )
                                    }
                                >
                                    <Check className="mr-1 h-4 w-4" /> Activate
                                </Button>
                            )}
                            {['ACTIVE', 'DORMANT', 'FROZEN'].includes(
                                account.status,
                            ) && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                        router.post(
                                            route(
                                                'financial-accounts.close',
                                                account.id,
                                            ),
                                        )
                                    }
                                >
                                    <Lock className="mr-1 h-4 w-4" /> Close
                                </Button>
                            )}
                        </div>
                    }
                />
                <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border bg-card p-3">
                        <p className="text-xs text-muted-foreground">Status</p>
                        <StatusBadge
                            tone={
                                account.status === 'ACTIVE'
                                    ? 'success'
                                    : 'neutral'
                            }
                        >
                            {account.status}
                        </StatusBadge>
                    </div>
                    <div className="rounded-lg border bg-card p-3">
                        <p className="text-xs text-muted-foreground">Balance</p>
                        <p className="mt-1 text-lg font-semibold tabular-nums">
                            {Number(account.balance).toFixed(4)}
                        </p>
                    </div>
                    <div className="rounded-lg border bg-card p-3">
                        <p className="text-xs text-muted-foreground">
                            Available balance
                        </p>
                        <p className="mt-1 text-lg font-semibold tabular-nums">
                            {Number(account.available_balance).toFixed(4)}
                        </p>
                    </div>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                    <section className="rounded-lg border bg-card p-4">
                        <h2 className="text-sm font-semibold">Holders</h2>
                        <div className="mt-3 divide-y">
                            {(account.holders ?? []).map((holder) => (
                                <div
                                    key={holder.id}
                                    className="flex items-center justify-between py-2 text-sm"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {holder.name ?? holder.customer_no}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {holder.pivot?.role ?? 'HOLDER'}
                                        </p>
                                    </div>
                                    <span className="text-muted-foreground tabular-nums">
                                        {holder.pivot?.ownership_percent ?? 0}%
                                    </span>
                                    <div className="flex gap-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => editHolder(holder)}
                                        >
                                            <Pencil className="mr-1 h-4 w-4" />{' '}
                                            Edit
                                        </Button>
                                        {holder.pivot?.role !== 'PRIMARY' && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    router.delete(
                                                        route(
                                                            'financial-accounts.holders.destroy',
                                                            [
                                                                account.id,
                                                                holder.id,
                                                            ],
                                                        ),
                                                    )
                                                }
                                            >
                                                <Trash2 className="mr-1 h-4 w-4" />{' '}
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {!account.holders?.length && (
                                <p className="py-2 text-sm text-muted-foreground">
                                    No additional holder records.
                                </p>
                            )}
                        </div>
                        <form
                            onSubmit={submitHolder}
                            className="mt-3 space-y-3 border-t pt-3"
                        >
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                    <Label>Customer</Label>
                                    <Select
                                        value={holderData.customer_id}
                                        onChange={(value) =>
                                            setHolderData('customer_id', value)
                                        }
                                        disabled={Boolean(editingHolderId)}
                                        options={[
                                            {
                                                value: '',
                                                label: 'Select customer',
                                            },
                                            ...customers
                                                .filter(
                                                    (customer) =>
                                                        !account.holders?.some(
                                                            (holder) =>
                                                                holder.id ===
                                                                    customer.id &&
                                                                holder.id !==
                                                                    editingHolderId,
                                                        ),
                                                )
                                                .map((customer) => ({
                                                    value: String(customer.id),
                                                    label: `${customer.customer_no} - ${customer.name}`,
                                                })),
                                        ]}
                                    />
                                    <InputError
                                        message={holderErrors.customer_id}
                                    />
                                </div>
                                <div>
                                    <Label>Role</Label>
                                    <Select
                                        value={holderData.role}
                                        onChange={(value) =>
                                            setHolderData('role', value)
                                        }
                                        options={[
                                            { value: 'JOINT', label: 'Joint' },
                                            {
                                                value: 'PRIMARY',
                                                label: 'Primary',
                                            },
                                        ]}
                                    />
                                    <InputError message={holderErrors.role} />
                                </div>
                                <div>
                                    <Label>Ownership percentage</Label>
                                    <Input
                                        type="number"
                                        min="0.0001"
                                        max="100"
                                        step="0.0001"
                                        value={holderData.ownership_percent}
                                        onChange={(event) =>
                                            setHolderData(
                                                'ownership_percent',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={holderErrors.ownership_percent}
                                    />
                                </div>
                                <div>
                                    <Label>Guardian customer ID</Label>
                                    <Input
                                        value={holderData.guardian_customer_id}
                                        onChange={(event) =>
                                            setHolderData(
                                                'guardian_customer_id',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Required for minor holders"
                                    />
                                    <InputError
                                        message={
                                            holderErrors.guardian_customer_id
                                        }
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                {editingHolderId && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            resetHolder();
                                            setEditingHolderId(null);
                                        }}
                                    >
                                        <X className="mr-1 h-4 w-4" /> Cancel
                                    </Button>
                                )}
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={holderProcessing}
                                >
                                    <Plus className="mr-1 h-4 w-4" />{' '}
                                    {editingHolderId ? 'Update' : 'Add'} holder
                                </Button>
                            </div>
                        </form>
                    </section>

                    <section className="rounded-lg border bg-card p-4">
                        <h2 className="text-sm font-semibold">Nominees</h2>
                        <div className="mt-3 divide-y">
                            {(account.nominees ?? []).map((nominee) => (
                                <div
                                    key={nominee.id}
                                    className="flex items-center justify-between py-2 text-sm"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {nominee.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {nominee.relationship}
                                            {nominee.is_primary
                                                ? ' · Primary'
                                                : ''}
                                        </p>
                                    </div>
                                    <span className="text-muted-foreground tabular-nums">
                                        {nominee.share_percent ?? 0}%
                                    </span>
                                    <div className="flex gap-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => editNominee(nominee)}
                                        >
                                            <Pencil className="mr-1 h-4 w-4" />{' '}
                                            Edit
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                router.delete(
                                                    route(
                                                        'financial-accounts.nominees.destroy',
                                                        [
                                                            account.id,
                                                            nominee.id,
                                                        ],
                                                    ),
                                                )
                                            }
                                        >
                                            <Trash2 className="mr-1 h-4 w-4" />{' '}
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {!account.nominees?.length && (
                                <p className="py-2 text-sm text-muted-foreground">
                                    No nominee records.
                                </p>
                            )}
                        </div>
                        <form
                            onSubmit={submitNominee}
                            className="mt-3 space-y-3 border-t pt-3"
                        >
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                    <Label>Name</Label>
                                    <Input
                                        value={data.name}
                                        onChange={(event) =>
                                            setData('name', event.target.value)
                                        }
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <div>
                                    <Label>Relationship</Label>
                                    <Input
                                        value={data.relationship}
                                        onChange={(event) =>
                                            setData(
                                                'relationship',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError message={errors.relationship} />
                                </div>
                                <div>
                                    <Label>Phone</Label>
                                    <Input
                                        value={data.phone}
                                        onChange={(event) =>
                                            setData('phone', event.target.value)
                                        }
                                    />
                                    <InputError message={errors.phone} />
                                </div>
                                <div>
                                    <Label>Share percentage</Label>
                                    <Input
                                        type="number"
                                        min="0.0001"
                                        max="100"
                                        step="0.0001"
                                        value={data.share_percent}
                                        onChange={(event) =>
                                            setData(
                                                'share_percent',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.share_percent}
                                    />
                                </div>
                                <div>
                                    <Label>Identification type</Label>
                                    <Input
                                        value={data.identification_type}
                                        onChange={(event) =>
                                            setData(
                                                'identification_type',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div>
                                    <Label>Identification number</Label>
                                    <Input
                                        value={data.identification_number}
                                        onChange={(event) =>
                                            setData(
                                                'identification_number',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={data.is_primary}
                                        onChange={(event) =>
                                            setData(
                                                'is_primary',
                                                event.target.checked,
                                            )
                                        }
                                    />{' '}
                                    Primary nominee
                                </label>
                                <div className="flex gap-2">
                                    {editingNomineeId && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                reset();
                                                setEditingNomineeId(null);
                                            }}
                                        >
                                            <X className="mr-1 h-4 w-4" />{' '}
                                            Cancel
                                        </Button>
                                    )}
                                    <Button
                                        type="submit"
                                        size="sm"
                                        disabled={processing}
                                    >
                                        <Plus className="mr-1 h-4 w-4" />{' '}
                                        {editingNomineeId ? 'Update' : 'Add'}{' '}
                                        nominee
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </section>
                </div>
                {account.account_type === 'SHARE' && (
                    <section className="rounded-lg border bg-card p-4">
                        <h2 className="text-sm font-semibold">Membership</h2>
                        {account.share_account && (
                            <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Membership number
                                    </p>
                                    <p className="font-medium">
                                        {account.share_account.membership_no ??
                                            'Not assigned'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Status
                                    </p>
                                    <p className="font-medium">
                                        {account.share_account
                                            .membership_status ?? 'PENDING'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Member since
                                    </p>
                                    <p className="font-medium">
                                        {account.share_account.member_since ??
                                            'Not set'}
                                    </p>
                                </div>
                            </div>
                        )}
                        <form
                            onSubmit={submitMembership}
                            className="mt-3 grid gap-3 border-t pt-3 sm:grid-cols-3 sm:items-end"
                        >
                            <div>
                                <Label>Membership number</Label>
                                <Input
                                    value={membershipData.membership_no}
                                    onChange={(event) =>
                                        setMembershipData(
                                            'membership_no',
                                            event.target.value.toUpperCase(),
                                        )
                                    }
                                    placeholder="Generated when blank"
                                />
                                <InputError
                                    message={membershipErrors.membership_no}
                                />
                            </div>
                            <div>
                                <Label>Member since</Label>
                                <Input
                                    type="date"
                                    value={membershipData.member_since}
                                    onChange={(event) =>
                                        setMembershipData(
                                            'member_since',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={membershipErrors.member_since}
                                />
                            </div>
                            <div>
                                <Label>Status</Label>
                                <Select
                                    value={membershipData.membership_status}
                                    onChange={(value) =>
                                        setMembershipData(
                                            'membership_status',
                                            value,
                                        )
                                    }
                                    options={[
                                        'PENDING',
                                        'ACTIVE',
                                        'SUSPENDED',
                                        'CLOSED',
                                    ].map((value) => ({ value, label: value }))}
                                />
                                <InputError
                                    message={membershipErrors.membership_status}
                                />
                            </div>
                            <div className="flex justify-end sm:col-span-3">
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={membershipProcessing}
                                >
                                    <Plus className="mr-1 h-4 w-4" />{' '}
                                    {account.share_account
                                        ? 'Update membership'
                                        : 'Register membership'}
                                </Button>
                            </div>
                        </form>
                    </section>
                )}
                {account.fixed_deposit && (
                    <section className="rounded-lg border bg-card p-4">
                        <h2 className="text-sm font-semibold">Fixed deposit</h2>
                        <div className="mt-3 grid gap-3 text-sm sm:grid-cols-4">
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Principal
                                </p>
                                <p className="font-medium">
                                    {account.fixed_deposit.principal_amount ??
                                        0}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Rate
                                </p>
                                <p className="font-medium">
                                    {account.fixed_deposit.contractual_rate ??
                                        0}
                                    %
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Maturity
                                </p>
                                <p className="font-medium">
                                    {account.fixed_deposit.maturity_date ??
                                        'Not set'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Status
                                </p>
                                <p className="font-medium">
                                    {account.fixed_deposit.status ?? 'PENDING'}
                                </p>
                            </div>
                        </div>
                    </section>
                )}
                {account.account_type === 'FIXED_DEPOSIT' &&
                    !account.fixed_deposit && (
                        <section className="rounded-lg border bg-card p-4">
                            <h2 className="text-sm font-semibold">
                                Open fixed deposit
                            </h2>
                            <form
                                onSubmit={submitFixedDeposit}
                                className="mt-3 grid gap-3 border-t pt-3 sm:grid-cols-2"
                            >
                                <div>
                                    <Label>Principal amount</Label>
                                    <Input
                                        type="number"
                                        min="0.0001"
                                        step="0.0001"
                                        value={fixedData.principal_amount}
                                        onChange={(event) =>
                                            setFixedData(
                                                'principal_amount',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={fixedErrors.principal_amount}
                                    />
                                </div>
                                <div>
                                    <Label>Contractual rate (%)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.000001"
                                        value={fixedData.contractual_rate}
                                        onChange={(event) =>
                                            setFixedData(
                                                'contractual_rate',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={fixedErrors.contractual_rate}
                                    />
                                </div>
                                <div>
                                    <Label>Term (months)</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={fixedData.term_months}
                                        onChange={(event) =>
                                            setFixedData(
                                                'term_months',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={fixedErrors.term_months}
                                    />
                                </div>
                                <div>
                                    <Label>Started at</Label>
                                    <Input
                                        type="date"
                                        value={fixedData.started_at}
                                        onChange={(event) =>
                                            setFixedData(
                                                'started_at',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={fixedErrors.started_at}
                                    />
                                </div>
                                <div>
                                    <Label>Maturity instruction</Label>
                                    <Select
                                        value={fixedData.maturity_instruction}
                                        onChange={(value) =>
                                            setFixedData(
                                                'maturity_instruction',
                                                value,
                                            )
                                        }
                                        options={[
                                            'PAYOUT',
                                            'RENEW_PRINCIPAL',
                                            'RENEW_PRINCIPAL_AND_INTEREST',
                                        ].map((value) => ({
                                            value,
                                            label: value.replaceAll('_', ' '),
                                        }))}
                                    />
                                    <InputError
                                        message={
                                            fixedErrors.maturity_instruction
                                        }
                                    />
                                </div>
                                <div className="flex items-end justify-end">
                                    <Button
                                        type="submit"
                                        disabled={fixedProcessing}
                                    >
                                        <Plus className="mr-1 h-4 w-4" /> Open
                                        contract
                                    </Button>
                                </div>
                            </form>
                        </section>
                    )}
                {account.recurring_deposit && (
                    <section className="rounded-lg border bg-card p-4">
                        <h2 className="text-sm font-semibold">
                            Recurring deposit
                        </h2>
                        <div className="mt-3 grid gap-3 text-sm sm:grid-cols-4">
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Installment
                                </p>
                                <p className="font-medium">
                                    {account.recurring_deposit
                                        .installment_amount ?? 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Frequency
                                </p>
                                <p className="font-medium">
                                    {account.recurring_deposit
                                        .installment_frequency ?? 'Not set'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Progress
                                </p>
                                <p className="font-medium">
                                    {account.recurring_deposit
                                        .paid_installments ?? 0}{' '}
                                    /{' '}
                                    {account.recurring_deposit
                                        .total_installments ?? 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Status
                                </p>
                                <p className="font-medium">
                                    {account.recurring_deposit.status ??
                                        'PENDING'}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 overflow-x-auto border-t pt-3">
                            <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                Installment schedule
                            </h3>
                            <table className="w-full text-left text-sm">
                                <thead className="border-b text-xs text-muted-foreground">
                                    <tr>
                                        <th className="px-2 py-2">No.</th>
                                        <th className="px-2 py-2">Due date</th>
                                        <th className="px-2 py-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {(
                                        account.recurring_deposit
                                            .installments ?? []
                                    ).map((installment) => (
                                        <tr key={installment.id}>
                                            <td className="px-2 py-2">
                                                {installment.installment_no}
                                            </td>
                                            <td className="px-2 py-2">
                                                {installment.due_date}
                                            </td>
                                            <td className="px-2 py-2">
                                                {installment.status}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
                {account.account_type === 'RECURRING_DEPOSIT' &&
                    !account.recurring_deposit && (
                        <section className="rounded-lg border bg-card p-4">
                            <h2 className="text-sm font-semibold">
                                Open recurring deposit
                            </h2>
                            <form
                                onSubmit={submitRecurringDeposit}
                                className="mt-3 grid gap-3 border-t pt-3 sm:grid-cols-2"
                            >
                                <div>
                                    <Label>Installment amount</Label>
                                    <Input
                                        type="number"
                                        min="0.0001"
                                        step="0.0001"
                                        value={recurringData.installment_amount}
                                        onChange={(event) =>
                                            setRecurringData(
                                                'installment_amount',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={
                                            recurringErrors.installment_amount
                                        }
                                    />
                                </div>
                                <div>
                                    <Label>Frequency</Label>
                                    <Select
                                        value={
                                            recurringData.installment_frequency
                                        }
                                        onChange={(value) =>
                                            setRecurringData(
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
                                        message={
                                            recurringErrors.installment_frequency
                                        }
                                    />
                                </div>
                                <div>
                                    <Label>Total installments</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={recurringData.total_installments}
                                        onChange={(event) =>
                                            setRecurringData(
                                                'total_installments',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={
                                            recurringErrors.total_installments
                                        }
                                    />
                                </div>
                                <div>
                                    <Label>Started at</Label>
                                    <Input
                                        type="date"
                                        value={recurringData.started_at}
                                        onChange={(event) =>
                                            setRecurringData(
                                                'started_at',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={recurringErrors.started_at}
                                    />
                                </div>
                                <div>
                                    <Label>Extension days</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={
                                            recurringData.maturity_extension_days
                                        }
                                        onChange={(event) =>
                                            setRecurringData(
                                                'maturity_extension_days',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={
                                            recurringErrors.maturity_extension_days
                                        }
                                    />
                                </div>
                                <div>
                                    <Label>Grace days</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={recurringData.grace_days}
                                        onChange={(event) =>
                                            setRecurringData(
                                                'grace_days',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={recurringErrors.grace_days}
                                    />
                                </div>
                                <div className="flex items-end justify-end sm:col-span-2">
                                    <Button
                                        type="submit"
                                        disabled={recurringProcessing}
                                    >
                                        <Plus className="mr-1 h-4 w-4" /> Open
                                        contract
                                    </Button>
                                </div>
                            </form>
                        </section>
                    )}
                {account.loan_account && (
                    <section className="rounded-lg border bg-card p-4">
                        <h2 className="text-sm font-semibold">Loan</h2>
                        <div className="mt-3 grid gap-3 text-sm sm:grid-cols-4">
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Loan number
                                </p>
                                <p className="font-medium">
                                    {account.loan_account.loan_no ??
                                        'Not assigned'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Principal
                                </p>
                                <p className="font-medium">
                                    {account.loan_account.principal_amount ?? 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Maturity
                                </p>
                                <p className="font-medium">
                                    {account.loan_account.maturity_date ??
                                        'Not set'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Status
                                </p>
                                <p className="font-medium">
                                    {account.loan_account.status ?? 'PENDING'}
                                </p>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </CustomAuthLayout>
    );
}
