import {
    ResourcePageHeader,
    StatusBadge,
} from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import useFlashToastHandler from '@/hooks/use-flash-toast-handler';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeftRight, Trash2 } from 'lucide-react';
import { route } from 'ziggy-js';

interface LedgerAccount {
    id: number;
    code: string;
    name: string;
}

interface Mapping {
    id: number;
    source_type: string;
    source_code: string;
    transaction_type: string;
    status: boolean;
    debit_account: LedgerAccount;
    credit_account: LedgerAccount;
}

interface Props extends SharedData {
    mappings: Mapping[];
    accounts: LedgerAccount[];
    sourceTypes: string[];
}

const transactionTypes: Record<string, string[]> = {
    BANK_TRANSACTION: [
        'DEPOSIT',
        'WITHDRAWAL',
        'TRANSFER_IN',
        'TRANSFER_OUT',
        'CHARGE',
        'INTEREST',
        'ADJUSTMENT',
    ],
    PETTY_CASH_TRANSACTION: [
        'FUNDING',
        'EXPENSE',
        'REPLENISHMENT',
        'RETURN',
        'ADJUSTMENT',
    ],
};

export default function TreasuryGlMappingsPage() {
    const { mappings, accounts, sourceTypes } = usePage<Props>().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        source_type: 'BANK_TRANSACTION',
        source_code: 'DEFAULT',
        transaction_type: 'DEPOSIT',
        debit_account_id: '',
        credit_account_id: '',
    });

    useFlashToastHandler();

    const save = (event: React.FormEvent) => {
        event.preventDefault();
        post(route('treasury-gl-mappings.store'), {
            preserveScroll: true,
            onSuccess: () =>
                reset(
                    'transaction_type',
                    'debit_account_id',
                    'credit_account_id',
                ),
        });
    };

    const remove = (mapping: Mapping) => {
        router.delete(route('treasury-gl-mappings.destroy', mapping.id), {
            preserveScroll: true,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'General Accounting', href: '' },
        {
            title: 'Treasury GL Mappings',
            href: route('treasury-gl-mappings.index'),
        },
    ];

    const accountOptions = [
        { value: '', label: 'Select GL account' },
        ...accounts.map((account) => ({
            value: String(account.id),
            label: `${account.code} - ${account.name}`,
        })),
    ];

    return (
        <CustomAuthLayout breadcrumbs={breadcrumbs}>
            <Head title="Treasury GL Mappings" />
            <div className="space-y-4">
                <ResourcePageHeader
                    title="Treasury GL Mappings"
                    description="Map Treasury transaction categories to balanced General Ledger entries."
                    action={
                        <Button asChild variant="outline" size="sm">
                            <Link href={route('general-accounting.dashboard')}>
                                <ArrowLeftRight className="mr-1 h-4 w-4" />
                                Accounting
                            </Link>
                        </Button>
                    }
                />

                <form
                    onSubmit={save}
                    className="grid gap-3 rounded-md border bg-card p-4 md:grid-cols-6 md:items-end"
                >
                    <div>
                        <Label htmlFor="source_type">Source type</Label>
                        <Select
                            value={data.source_type}
                            onChange={(value) => {
                                setData('source_type', value);
                                if (transactionTypes[value]) {
                                    setData(
                                        'transaction_type',
                                        transactionTypes[value][0],
                                    );
                                }
                            }}
                            options={sourceTypes.map((type) => ({
                                value: type,
                                label: type.replaceAll('_', ' '),
                            }))}
                        />
                        {errors.source_type && (
                            <p className="mt-1 text-xs text-destructive">
                                {errors.source_type}
                            </p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="source_code">Source code</Label>
                        <Input
                            id="source_code"
                            value={data.source_code}
                            onChange={(event) =>
                                setData('source_code', event.target.value)
                            }
                            placeholder="DEFAULT, VAULT, or product code"
                            required
                        />
                        {errors.source_code && (
                            <p className="mt-1 text-xs text-destructive">
                                {errors.source_code}
                            </p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="transaction_type">
                            Transaction type
                        </Label>
                        {transactionTypes[data.source_type] ? (
                            <Select
                                value={data.transaction_type}
                                onChange={(value) =>
                                    setData('transaction_type', value)
                                }
                                options={transactionTypes[data.source_type].map(
                                    (type) => ({
                                        value: type,
                                        label: type.replaceAll('_', ' '),
                                    }),
                                )}
                            />
                        ) : (
                            <Input
                                id="transaction_type"
                                value={data.transaction_type}
                                onChange={(event) =>
                                    setData(
                                        'transaction_type',
                                        event.target.value.toUpperCase(),
                                    )
                                }
                                placeholder="Transaction type"
                                required
                            />
                        )}
                        {errors.transaction_type && (
                            <p className="mt-1 text-xs text-destructive">
                                {errors.transaction_type}
                            </p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="debit_account_id">Debit account</Label>
                        <Select
                            value={data.debit_account_id}
                            onChange={(value) =>
                                setData('debit_account_id', value)
                            }
                            options={accountOptions}
                        />
                        {errors.debit_account_id && (
                            <p className="mt-1 text-xs text-destructive">
                                {errors.debit_account_id}
                            </p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="credit_account_id">
                            Credit account
                        </Label>
                        <Select
                            value={data.credit_account_id}
                            onChange={(value) =>
                                setData('credit_account_id', value)
                            }
                            options={accountOptions}
                        />
                        {errors.credit_account_id && (
                            <p className="mt-1 text-xs text-destructive">
                                {errors.credit_account_id}
                            </p>
                        )}
                    </div>
                    <Button
                        type="submit"
                        disabled={processing || accounts.length < 2}
                    >
                        Save mapping
                    </Button>
                </form>

                <div className="overflow-x-auto rounded-md border bg-card">
                    <table className="w-full min-w-225 text-sm">
                        <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 font-medium">
                                    Source
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Transaction
                                </th>
                                <th className="px-4 py-3 font-medium">Debit</th>
                                <th className="px-4 py-3 font-medium">
                                    Credit
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-right font-medium">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {mappings.map((mapping) => (
                                <tr
                                    key={mapping.id}
                                    className="border-b last:border-0"
                                >
                                    <td className="px-4 py-3">
                                        <div>
                                            {mapping.source_type.replaceAll(
                                                '_',
                                                ' ',
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {mapping.source_code}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {mapping.transaction_type.replaceAll(
                                            '_',
                                            ' ',
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {mapping.debit_account.code} -{' '}
                                        {mapping.debit_account.name}
                                    </td>
                                    <td className="px-4 py-3">
                                        {mapping.credit_account.code} -{' '}
                                        {mapping.credit_account.name}
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge
                                            tone={
                                                mapping.status
                                                    ? 'success'
                                                    : 'danger'
                                            }
                                        >
                                            {mapping.status
                                                ? 'Active'
                                                : 'Inactive'}
                                        </StatusBadge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            title="Delete mapping"
                                            onClick={() => remove(mapping)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {mappings.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-8 text-center text-muted-foreground"
                                    >
                                        No Treasury GL mappings configured.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </CustomAuthLayout>
    );
}
