import InputError from '@/components/input-error';
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
import { Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';

type Option = { id: number; code?: string; name: string };
type BudgetEntry = {
    account_id: string;
    cost_center_id: string;
    fiscal_period_id: string;
    amount: string;
};

export interface BudgetDialogItem {
    id: number;
    name: string;
    fiscal_year_id: number;
    status: 'DRAFT' | 'ACTIVE' | 'CLOSED';
    entries: {
        account_id: number;
        cost_center_id: number | null;
        fiscal_period_id: number | null;
        amount: string | number;
    }[];
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    budget?: BudgetDialogItem | null;
    fiscalYears: Option[];
    fiscalPeriods: (Option & { fiscal_year_id: number })[];
    accounts: Option[];
    costCenters: Option[];
}

const emptyEntry = (): BudgetEntry => ({
    account_id: '',
    cost_center_id: '',
    fiscal_period_id: '',
    amount: '',
});

export default function BudgetDialog({
    open,
    onOpenChange,
    budget,
    fiscalYears,
    fiscalPeriods,
    accounts,
    costCenters,
}: Props) {
    const form = useForm({
        name: '',
        fiscal_year_id: String(fiscalYears[0]?.id ?? ''),
        entries: [] as BudgetEntry[],
    });
    const { clearErrors, setData } = form;

    useEffect(() => {
        setData({
            name: budget?.name ?? '',
            fiscal_year_id: String(
                budget?.fiscal_year_id ?? fiscalYears[0]?.id ?? '',
            ),
            entries:
                budget?.entries.map((entry) => ({
                    account_id: String(entry.account_id),
                    cost_center_id: entry.cost_center_id
                        ? String(entry.cost_center_id)
                        : '',
                    fiscal_period_id: entry.fiscal_period_id
                        ? String(entry.fiscal_period_id)
                        : '',
                    amount: String(entry.amount),
                })) ?? [],
        });
        clearErrors();
    }, [budget, clearErrors, fiscalYears, open, setData]);

    const updateEntry = (
        index: number,
        field: keyof BudgetEntry,
        value: string,
    ) => {
        const entries = [...form.data.entries];
        entries[index] = { ...entries[index], [field]: value };
        form.setData('entries', entries);
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        };

        if (budget) {
            form.put(route('budgets.update', budget.id), options);
        } else {
            form.post(route('budgets.store'), options);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!form.processing) onOpenChange(nextOpen);
            }}
        >
            <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {budget ? 'Edit budget' : 'Create budget'}
                    </DialogTitle>
                    <DialogDescription>
                        Set planned amounts for accounts, cost centers, and
                        fiscal periods.
                    </DialogDescription>
                </DialogHeader>
                <form className="space-y-5" onSubmit={submit}>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="budget-name">Name</Label>
                            <Input
                                id="budget-name"
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                                required
                            />
                            <InputError message={form.errors.name} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Fiscal year</Label>
                            <Select
                                value={form.data.fiscal_year_id}
                                onChange={(value) =>
                                    form.setData('fiscal_year_id', value)
                                }
                                options={fiscalYears.map((year) => ({
                                    value: String(year.id),
                                    label: year.name,
                                }))}
                            />
                            <InputError message={form.errors.fiscal_year_id} />
                        </div>
                    </div>

                    <section className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <h3 className="font-medium">Budget entries</h3>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    form.setData('entries', [
                                        ...form.data.entries,
                                        emptyEntry(),
                                    ])
                                }
                            >
                                <Plus className="h-4 w-4" />
                                Add entry
                            </Button>
                        </div>
                        <div className="max-h-[45vh] space-y-3 overflow-y-auto pr-1">
                            {form.data.entries.map((entry, index) => (
                                <div
                                    key={index}
                                    className="grid items-end gap-3 rounded-md border p-3 md:grid-cols-[1.2fr_1.2fr_1.2fr_9rem_auto]"
                                >
                                    <div className="space-y-1.5">
                                        <Label>Account</Label>
                                        <Select
                                            value={entry.account_id}
                                            onChange={(value) =>
                                                updateEntry(
                                                    index,
                                                    'account_id',
                                                    value,
                                                )
                                            }
                                            options={[
                                                {
                                                    value: '',
                                                    label: 'Select account',
                                                },
                                                ...accounts.map((item) => ({
                                                    value: String(item.id),
                                                    label: `${item.code} - ${item.name}`,
                                                })),
                                            ]}
                                        />
                                        <InputError
                                            message={
                                                form.errors[
                                                    `entries.${index}.account_id`
                                                ]
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Cost center</Label>
                                        <Select
                                            value={entry.cost_center_id}
                                            onChange={(value) =>
                                                updateEntry(
                                                    index,
                                                    'cost_center_id',
                                                    value,
                                                )
                                            }
                                            options={[
                                                {
                                                    value: '',
                                                    label: 'All cost centers',
                                                },
                                                ...costCenters.map((item) => ({
                                                    value: String(item.id),
                                                    label: `${item.code} - ${item.name}`,
                                                })),
                                            ]}
                                        />
                                        <InputError
                                            message={
                                                form.errors[
                                                    `entries.${index}.cost_center_id`
                                                ]
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Fiscal period</Label>
                                        <Select
                                            value={entry.fiscal_period_id}
                                            onChange={(value) =>
                                                updateEntry(
                                                    index,
                                                    'fiscal_period_id',
                                                    value,
                                                )
                                            }
                                            options={[
                                                {
                                                    value: '',
                                                    label: 'Annual',
                                                },
                                                ...fiscalPeriods
                                                    .filter(
                                                        (period) =>
                                                            String(
                                                                period.fiscal_year_id,
                                                            ) ===
                                                            form.data
                                                                .fiscal_year_id,
                                                    )
                                                    .map((period) => ({
                                                        value: String(
                                                            period.id,
                                                        ),
                                                        label: period.name,
                                                    })),
                                            ]}
                                        />
                                        <InputError
                                            message={
                                                form.errors[
                                                    `entries.${index}.fiscal_period_id`
                                                ]
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Amount</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.0001"
                                            value={entry.amount}
                                            onChange={(event) =>
                                                updateEntry(
                                                    index,
                                                    'amount',
                                                    event.target.value,
                                                )
                                            }
                                            required
                                        />
                                        <InputError
                                            message={
                                                form.errors[
                                                    `entries.${index}.amount`
                                                ]
                                            }
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        title="Remove entry"
                                        aria-label="Remove entry"
                                        disabled={form.data.entries.length <= 1}
                                        onClick={() =>
                                            form.setData(
                                                'entries',
                                                form.data.entries.filter(
                                                    (_, current) =>
                                                        current !== index,
                                                ),
                                            )
                                        }
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                            <InputError message={form.errors.entries} />
                        </div>
                    </section>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={form.processing}
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing
                                ? 'Saving...'
                                : budget
                                  ? 'Update budget'
                                  : 'Save draft budget'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
