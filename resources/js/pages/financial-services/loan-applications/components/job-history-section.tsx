import { JobHistory } from '../types';
import DetailInput from './detail-input';
import RepeatableRow from './repeatable-row';
import RepeatableSection from './repeatable-section';

type Props = { rows: JobHistory[]; onChange: (rows: JobHistory[]) => void };

export default function JobHistorySection({ rows, onChange }: Props) {
    const update = (
        index: number,
        key: keyof JobHistory,
        value: string | boolean,
    ) =>
        onChange(
            rows.map((row, i) =>
                i === index ? { ...row, [key]: value } : row,
            ),
        );

    return (
        <RepeatableSection
            title="Employment history"
            description="Add current and previous employment information."
            count={rows.length}
            addLabel="Add employment"
            onAdd={() =>
                onChange([
                    ...rows,
                    {
                        employer_name: '',
                        job_title: '',
                        employment_type: '',
                        start_date: '',
                        end_date: '',
                        monthly_income: '',
                        is_current: false,
                        notes: '',
                    },
                ])
            }
        >
            {rows.length === 0 ? (
                <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                    No employment history added yet.
                </p>
            ) : (
                rows.map((row, index) => (
                    <RepeatableRow
                        key={index}
                        index={index}
                        title="Employment"
                        columns="sm:grid-cols-2 lg:grid-cols-3"
                        onRemove={() =>
                            onChange(rows.filter((_, i) => i !== index))
                        }
                    >
                        <DetailInput
                            label="Employer"
                            value={row.employer_name}
                            onChange={(v) => update(index, 'employer_name', v)}
                        />
                        <DetailInput
                            label="Job title"
                            value={row.job_title}
                            onChange={(v) => update(index, 'job_title', v)}
                        />
                        <DetailInput
                            label="Employment type"
                            value={row.employment_type}
                            placeholder="Full-time, contract..."
                            onChange={(v) =>
                                update(index, 'employment_type', v)
                            }
                        />
                        <DetailInput
                            label="Monthly income (৳)"
                            type="number"
                            value={row.monthly_income}
                            onChange={(v) => update(index, 'monthly_income', v)}
                        />
                        <DetailInput
                            label="Start date"
                            type="date"
                            value={row.start_date}
                            onChange={(v) => update(index, 'start_date', v)}
                        />
                        <DetailInput
                            label="End date"
                            type="date"
                            value={row.end_date}
                            onChange={(v) => update(index, 'end_date', v)}
                        />
                        <label className="flex min-h-9 items-center gap-2 text-sm sm:col-span-2 lg:col-span-3">
                            <input
                                type="checkbox"
                                className="size-4 rounded border-input accent-primary"
                                checked={row.is_current}
                                onChange={(e) =>
                                    update(
                                        index,
                                        'is_current',
                                        e.target.checked,
                                    )
                                }
                            />
                            <span>Currently employed here</span>
                        </label>
                        <div className="sm:col-span-2 lg:col-span-3">
                            <DetailInput
                                label="Notes"
                                value={row.notes}
                                onChange={(v) => update(index, 'notes', v)}
                            />
                        </div>
                    </RepeatableRow>
                ))
            )}
        </RepeatableSection>
    );
}
