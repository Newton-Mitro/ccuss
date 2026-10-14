import { ExpenseDetail } from '../types';
import DetailInput from './detail-input';
import RepeatableRow from './repeatable-row';
import RepeatableSection from './repeatable-section';

type Props = {
    rows: ExpenseDetail[];
    onChange: (rows: ExpenseDetail[]) => void;
};

export default function ExpenseDetailsSection({ rows, onChange }: Props) {
    const update = (index: number, key: keyof ExpenseDetail, value: string) =>
        onChange(
            rows.map((row, i) =>
                i === index ? { ...row, [key]: value } : row,
            ),
        );

    return (
        <RepeatableSection
            title="Expense details"
            description="Capture recurring monthly household or business expenses."
            count={rows.length}
            addLabel="Add expense"
            onAdd={() =>
                onChange([
                    ...rows,
                    { category: '', monthly_amount: '', notes: '' },
                ])
            }
        >
            {rows.length === 0 ? (
                <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                    No expenses added yet.
                </p>
            ) : (
                rows.map((row, index) => (
                    <RepeatableRow
                        key={index}
                        index={index}
                        title="Expense"
                        onRemove={() =>
                            onChange(rows.filter((_, i) => i !== index))
                        }
                    >
                        <DetailInput
                            label="Category"
                            value={row.category}
                            placeholder="e.g. Rent"
                            onChange={(v) => update(index, 'category', v)}
                        />
                        <DetailInput
                            label="Monthly amount (৳)"
                            type="number"
                            value={row.monthly_amount}
                            onChange={(v) => update(index, 'monthly_amount', v)}
                        />
                        <DetailInput
                            label="Notes"
                            value={row.notes}
                            placeholder="Optional details"
                            onChange={(v) => update(index, 'notes', v)}
                        />
                    </RepeatableRow>
                ))
            )}
        </RepeatableSection>
    );
}
