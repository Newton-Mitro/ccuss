import { IncomeDetail } from '../types';
import DetailInput from './detail-input';
import RepeatableRow from './repeatable-row';
import RepeatableSection from './repeatable-section';

type Props = { rows: IncomeDetail[]; onChange: (rows: IncomeDetail[]) => void };

export default function IncomeDetailsSection({ rows, onChange }: Props) {
    const update = (index: number, key: keyof IncomeDetail, value: string) =>
        onChange(
            rows.map((row, i) =>
                i === index ? { ...row, [key]: value } : row,
            ),
        );

    return (
        <RepeatableSection
            title="Income details"
            description="Record the applicant's regular income sources."
            count={rows.length}
            addLabel="Add income"
            onAdd={() =>
                onChange([
                    ...rows,
                    { source: '', monthly_amount: '', notes: '' },
                ])
            }
        >
            {rows.length === 0 ? (
                <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                    No income sources added yet.
                </p>
            ) : (
                rows.map((row, index) => (
                    <RepeatableRow
                        key={index}
                        index={index}
                        title="Income source"
                        onRemove={() =>
                            onChange(rows.filter((_, i) => i !== index))
                        }
                    >
                        <DetailInput
                            label="Income source"
                            value={row.source}
                            placeholder="e.g. Salary"
                            onChange={(v) => update(index, 'source', v)}
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
