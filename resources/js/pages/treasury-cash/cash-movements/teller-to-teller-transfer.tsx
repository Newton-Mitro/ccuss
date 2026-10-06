import { formatDate } from '@/lib/date_util';
import type { TellerTransferPageProps } from '@/types/treasury-cash/forms';
import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowRightLeft } from 'lucide-react';
import { FormEvent } from 'react';
import { route } from 'ziggy-js';
import HeadingSmall from '../../../components/heading-small';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import useFlashToastHandler from '../../../hooks/use-flash-toast-handler';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';
import { BreadcrumbItem } from '../../../types';

export default function TellerToTellerTransfer() {
    const {
        branch_day,
        transfer_type,
        from_cash_locations,
        to_cash_locations,
        bank_accounts = [],
    } = usePage<TellerTransferPageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        from_cash_location_id: '',
        to_cash_location_id: '',
        bank_account_id: '',
        amount: '',
        note: '',
    });

    useFlashToastHandler();

    const transferConfig = {
        TELLER_TO_TELLER: {
            title: 'Teller to Teller Transfer',
            description: 'Transfer cash between active tellers in your branch.',
            fromLabel: 'From teller',
            toLabel: 'To teller',
            routeName: 'cash-movements.teller-to-teller-transfer.store',
        },
        VAULT_TO_TELLER: {
            title: 'Vault to Teller Transfer',
            description:
                'Transfer cash from a vault to an active teller in your branch.',
            fromLabel: 'From vault',
            toLabel: 'To teller',
            routeName: 'vault-transfers.root.vault-to-teller.store',
        },
        TELLER_TO_VAULT: {
            title: 'Teller to Vault Transfer',
            description:
                'Transfer cash from an active teller to a vault in your branch.',
            fromLabel: 'From teller',
            toLabel: 'To vault',
            routeName: 'vault-transfers.root.teller-to-vault.store',
        },
        VAULT_TO_VAULT: {
            title: 'Vault to Vault Transfer',
            description: 'Transfer cash between active vaults in your branch.',
            fromLabel: 'From vault',
            toLabel: 'To vault',
            routeName: 'vault-transfers.root.vault-to-vault.store',
        },
        BANK_TO_VAULT: {
            title: 'Bank to Vault Funding',
            description:
                'Withdraw funds from a bank account and add them to an open vault session.',
            fromLabel: 'From bank account',
            toLabel: 'To vault',
            routeName: 'vault-transfers.root.bank-to-vault.store',
        },
        VAULT_TO_BANK: {
            title: 'Vault to Bank Deposit',
            description:
                'Deposit cash from an open vault session into a bank account.',
            fromLabel: 'From vault',
            toLabel: 'To bank account',
            routeName: 'vault-transfers.root.vault-to-bank.store',
        },
    }[transfer_type];

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Treasury & Cash', href: '' },
        { title: 'Cash Management', href: '' },
        {
            title: 'Cash Transfers',
            href: route('cash-movements.teller-to-teller-transfer'),
        },
    ];

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(route(transferConfig.routeName));
    };
    const hasSource =
        transfer_type === 'BANK_TO_VAULT'
            ? Boolean(data.bank_account_id)
            : Boolean(data.from_cash_location_id);
    const hasDestination =
        transfer_type === 'VAULT_TO_BANK'
            ? Boolean(data.bank_account_id)
            : Boolean(data.to_cash_location_id);

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title={transferConfig.title} />
            <div className="max-w-2xl space-y-6 text-foreground">
                <HeadingSmall
                    title={transferConfig.title}
                    description={transferConfig.description}
                />

                <div className="rounded-md border bg-card p-4 text-sm">
                    <div className="flex items-center gap-2 font-medium">
                        <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                        Business day
                    </div>
                    <div className="mt-1 text-muted-foreground">
                        {branch_day
                            ? `${formatDate(branch_day.business_date)} (${branch_day.status})`
                            : 'No open branch day'}
                    </div>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-4 rounded-md border bg-card p-4"
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label
                                htmlFor={
                                    transfer_type === 'BANK_TO_VAULT'
                                        ? 'bank_account_id'
                                        : 'from_cash_location_id'
                                }
                                className="text-sm font-medium"
                            >
                                {transferConfig.fromLabel}
                            </label>
                            {transfer_type === 'BANK_TO_VAULT' ? (
                                <Select
                                    id="bank_account_id"
                                    className="h-9"
                                    value={data.bank_account_id}
                                    onChange={(value) =>
                                        setData('bank_account_id', value)
                                    }
                                    placeholder="Select bank account"
                                    options={[
                                        {
                                            value: '',
                                            label: 'Select bank account',
                                        },
                                        ...bank_accounts.map((account) => ({
                                            value: String(account.id),
                                            label: `${account.account_name} (${account.account_number})`,
                                        })),
                                    ]}
                                />
                            ) : (
                                <Select
                                    id="from_cash_location_id"
                                    className="h-9"
                                    value={data.from_cash_location_id}
                                    onChange={(value) =>
                                        setData('from_cash_location_id', value)
                                    }
                                    placeholder="Select source"
                                    options={[
                                        { value: '', label: 'Select source' },
                                        ...from_cash_locations
                                            .filter(
                                                (location) =>
                                                    String(location.id) !==
                                                    data.to_cash_location_id,
                                            )
                                            .map((location) => ({
                                                value: String(location.id),
                                                label: `${location.name} (${location.code})`,
                                            })),
                                    ]}
                                />
                            )}
                            {errors.from_cash_location_id && (
                                <p className="text-sm text-destructive">
                                    {errors.from_cash_location_id}
                                </p>
                            )}
                            {errors.bank_account_id && (
                                <p className="text-sm text-destructive">
                                    {errors.bank_account_id}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label
                                htmlFor={
                                    transfer_type === 'VAULT_TO_BANK'
                                        ? 'bank_account_id'
                                        : 'to_cash_location_id'
                                }
                                className="text-sm font-medium"
                            >
                                {transferConfig.toLabel}
                            </label>
                            {transfer_type === 'VAULT_TO_BANK' ? (
                                <Select
                                    id="bank_account_id"
                                    className="h-9"
                                    value={data.bank_account_id}
                                    onChange={(value) =>
                                        setData('bank_account_id', value)
                                    }
                                    placeholder="Select bank account"
                                    options={[
                                        {
                                            value: '',
                                            label: 'Select bank account',
                                        },
                                        ...bank_accounts.map((account) => ({
                                            value: String(account.id),
                                            label: `${account.account_name} (${account.account_number})`,
                                        })),
                                    ]}
                                />
                            ) : (
                                <Select
                                    id="to_cash_location_id"
                                    className="h-9"
                                    value={data.to_cash_location_id}
                                    onChange={(value) =>
                                        setData('to_cash_location_id', value)
                                    }
                                    placeholder="Select destination"
                                    options={[
                                        {
                                            value: '',
                                            label: 'Select destination',
                                        },
                                        ...to_cash_locations
                                            .filter(
                                                (location) =>
                                                    String(location.id) !==
                                                    data.from_cash_location_id,
                                            )
                                            .map((location) => ({
                                                value: String(location.id),
                                                label: `${location.name} (${location.code})`,
                                            })),
                                    ]}
                                />
                            )}
                            {transfer_type === 'VAULT_TO_BANK' &&
                                errors.bank_account_id && (
                                    <p className="text-sm text-destructive">
                                        {errors.bank_account_id}
                                    </p>
                                )}
                            {errors.to_cash_location_id && (
                                <p className="text-sm text-destructive">
                                    {errors.to_cash_location_id}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="amount" className="text-sm font-medium">
                            Amount
                        </label>
                        <Input
                            id="amount"
                            type="number"
                            min="0.01"
                            step="0.0001"
                            value={data.amount}
                            onChange={(event) =>
                                setData('amount', event.target.value)
                            }
                            required
                        />
                        {errors.amount && (
                            <p className="text-sm text-destructive">
                                {errors.amount}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="note" className="text-sm font-medium">
                            Note
                        </label>
                        <Input
                            id="note"
                            value={data.note}
                            onChange={(event) =>
                                setData('note', event.target.value)
                            }
                            maxLength={2000}
                            placeholder="Optional transfer note"
                        />
                        {errors.note && (
                            <p className="text-sm text-destructive">
                                {errors.note}
                            </p>
                        )}
                    </div>
                    <Button
                        type="submit"
                        disabled={
                            processing ||
                            !branch_day ||
                            !hasSource ||
                            !hasDestination
                        }
                    >
                        Create pending transfer
                    </Button>
                </form>
            </div>
        </CustomAuthLayout>
    );
}
