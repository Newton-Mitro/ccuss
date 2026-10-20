import InputError from '@/components/input-error';
import { StatusBadge } from '@/components/resource-page-shell';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { route } from 'ziggy-js';

export interface TreasuryGlLedgerAccount {
    id: number;
    code: string;
    name: string;
    is_control_account: boolean;
    is_cash_account: boolean;
}

export interface TreasuryGlMapping {
    id: number;
    source_type: string;
    source_code: string;
    transaction_type: string;
    status: boolean;
    debit_account: TreasuryGlLedgerAccount;
    credit_account: TreasuryGlLedgerAccount;
    debit_account_id?: number;
    credit_account_id?: number;
}

interface MappingFormPanelProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sourceTypes: string[];
    accounts: TreasuryGlLedgerAccount[];
    mapping?: TreasuryGlMapping | null;
}

const transactionTypes: Record<string, string[]> = {
    PETTY_CASH_TRANSACTION: [
        'FUNDING',
        'EXPENSE',
        'REPLENISHMENT',
        'RETURN',
        'ADJUSTMENT',
    ],
    CASH_LOCATION: ['DEPOSIT', 'WITHDRAWAL'],
};

export function MappingFormPanel({
    open,
    onOpenChange,
    sourceTypes,
    accounts,
    mapping,
}: MappingFormPanelProps) {
    const panelRef = useRef<HTMLElement>(null);
    const form = useForm({
        source_type: sourceTypes[0] ?? 'BANK_ACCOUNT',
        source_code: 'DEFAULT',
        transaction_type: 'DEPOSIT',
        debit_account_id: '',
        credit_account_id: '',
        status: true,
    });

    useEffect(() => {
        form.setData({
            source_type:
                mapping?.source_type ?? sourceTypes[0] ?? 'BANK_ACCOUNT',
            source_code: mapping?.source_code ?? 'DEFAULT',
            transaction_type: mapping?.transaction_type ?? 'DEPOSIT',
            debit_account_id: mapping
                ? String(mapping.debit_account_id ?? mapping.debit_account.id)
                : '',
            credit_account_id: mapping
                ? String(mapping.credit_account_id ?? mapping.credit_account.id)
                : '',
            status: mapping?.status ?? true,
        });
        form.clearErrors();
    }, [mapping, open, sourceTypes]);

    useEffect(() => {
        if (open) {
            panelRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    }, [open]);

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        };

        if (mapping) {
            form.put(route('treasury-gl-mappings.update', mapping.id), options);
        } else {
            form.post(route('treasury-gl-mappings.store'), options);
        }
    };

    const accountOptions = [
        { value: '', label: 'Select GL account' },
        ...accounts.map((account) => ({
            value: String(account.id),
            label: `${account.code} - ${account.name}${account.is_control_account && account.is_cash_account ? ' · Cash control' : account.is_cash_account ? ' · Cash' : ''}`,
        })),
    ];
    const cashControlSide =
        form.data.source_type === 'CASH_LOCATION'
            ? form.data.transaction_type === 'DEPOSIT'
                ? 'debit'
                : 'credit'
            : null;

    return (
        open && (
            <section
                ref={panelRef}
                className="scroll-mt-4 space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
            >
                <div>
                    <h2 className="text-lg font-semibold">
                        {mapping
                            ? 'Edit Treasury GL mapping'
                            : 'Add Treasury GL mapping'}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Map a Treasury transaction to debit and credit ledger
                        accounts.
                    </p>
                </div>
                <form className="space-y-5" onSubmit={submit}>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label>Source type</Label>
                            <Select
                                value={form.data.source_type}
                                onChange={(value) => {
                                    form.setData('source_type', value);
                                    if (transactionTypes[value]) {
                                        form.setData(
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
                            <InputError message={form.errors.source_type} />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="mapping-source-code">
                                Source code
                            </Label>
                            <Input
                                id="mapping-source-code"
                                value={form.data.source_code}
                                onChange={(event) =>
                                    form.setData(
                                        'source_code',
                                        event.target.value,
                                    )
                                }
                                placeholder="DEFAULT, TELLER, or VAULT"
                                required
                            />
                            <InputError message={form.errors.source_code} />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="mapping-transaction-type">
                                Transaction type
                            </Label>
                            {transactionTypes[form.data.source_type] ? (
                                <Select
                                    value={form.data.transaction_type}
                                    onChange={(value) =>
                                        form.setData('transaction_type', value)
                                    }
                                    options={transactionTypes[
                                        form.data.source_type
                                    ].map((type) => ({
                                        value: type,
                                        label: type.replaceAll('_', ' '),
                                    }))}
                                />
                            ) : (
                                <Input
                                    id="mapping-transaction-type"
                                    value={form.data.transaction_type}
                                    onChange={(event) =>
                                        form.setData(
                                            'transaction_type',
                                            event.target.value.toUpperCase(),
                                        )
                                    }
                                    placeholder="Transaction type"
                                    required
                                />
                            )}
                            <InputError
                                message={form.errors.transaction_type}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Debit account</Label>
                            <Select
                                value={form.data.debit_account_id}
                                onChange={(value) =>
                                    form.setData('debit_account_id', value)
                                }
                                options={accountOptions}
                            />
                            {cashControlSide === 'debit' && (
                                <p className="text-xs text-muted-foreground">
                                    Select a cash and control account.
                                </p>
                            )}
                            <InputError
                                message={form.errors.debit_account_id}
                            />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                            <Label>Credit account</Label>
                            <Select
                                value={form.data.credit_account_id}
                                onChange={(value) =>
                                    form.setData('credit_account_id', value)
                                }
                                options={accountOptions}
                            />
                            {cashControlSide === 'credit' && (
                                <p className="text-xs text-muted-foreground">
                                    Select a cash and control account.
                                </p>
                            )}
                            <InputError
                                message={form.errors.credit_account_id}
                            />
                        </div>
                    </div>
                    {mapping && (
                        <label className="flex items-center gap-2 rounded-md border p-3 text-sm">
                            <Input
                                type="checkbox"
                                checked={form.data.status}
                                onChange={(event) =>
                                    form.setData('status', event.target.checked)
                                }
                            />
                            Active
                        </label>
                    )}
                    {cashControlSide && (
                        <p className="text-xs text-muted-foreground">
                            The cash-side account must be marked as both a cash
                            account and a control account in the chart of
                            accounts.
                        </p>
                    )}
                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={form.processing}
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.processing || accounts.length < 2}
                        >
                            {form.processing
                                ? 'Saving...'
                                : mapping
                                  ? 'Save changes'
                                  : 'Save mapping'}
                        </Button>
                    </div>
                </form>
            </section>
        )
    );
}

interface MappingDetailsDialogProps {
    mapping: TreasuryGlMapping | null;
    onOpenChange: (open: boolean) => void;
}

export function MappingDetailsDialog({
    mapping,
    onOpenChange,
}: MappingDetailsDialogProps) {
    const details = [
        {
            label: 'Source',
            value: mapping
                ? `${mapping.source_type.replaceAll('_', ' ')} · ${mapping.source_code}`
                : '',
        },
        {
            label: 'Transaction type',
            value: mapping?.transaction_type.replaceAll('_', ' '),
        },
        {
            label: 'Debit account',
            value: mapping
                ? `${mapping.debit_account.code} - ${mapping.debit_account.name}`
                : '',
        },
        {
            label: 'Credit account',
            value: mapping
                ? `${mapping.credit_account.code} - ${mapping.credit_account.name}`
                : '',
        },
    ];

    return (
        <Dialog
            open={mapping !== null}
            onOpenChange={(open) => {
                if (!open) onOpenChange(false);
            }}
        >
            <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
                <DialogHeader className="rounded-lg border bg-linear-to-br from-amber-500/10 via-background to-orange-500/10 p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                                Treasury mapping
                            </p>
                            <DialogTitle className="text-2xl">
                                {mapping?.source_code}
                            </DialogTitle>
                            <DialogDescription>
                                Debit and credit ledger assignment.
                            </DialogDescription>
                        </div>
                        {mapping && (
                            <StatusBadge
                                tone={mapping.status ? 'success' : 'danger'}
                            >
                                {mapping.status ? 'Active' : 'Inactive'}
                            </StatusBadge>
                        )}
                    </div>
                </DialogHeader>
                <div className="grid gap-3 sm:grid-cols-2">
                    {details.map((detail) => (
                        <div
                            key={detail.label}
                            className="min-w-0 rounded-lg border bg-card p-3"
                        >
                            <p className="text-xs font-medium text-muted-foreground">
                                {detail.label}
                            </p>
                            <p className="mt-1 text-sm font-medium wrap-break-word">
                                {detail.value || '—'}
                            </p>
                        </div>
                    ))}
                </div>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
