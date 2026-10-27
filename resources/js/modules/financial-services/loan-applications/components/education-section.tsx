import { EducationDetail } from '@/modules/financial-services/loan-applications/types';
import DetailInput from '@/modules/financial-services/loan-applications/components/detail-input';
import RepeatableRow from '@/modules/financial-services/loan-applications/components/repeatable-row';
import RepeatableSection from '@/modules/financial-services/loan-applications/components/repeatable-section';
import type { Props } from '@/modules/financial-services/types/loan-applications/components/education-section.types';


export default function EducationSection({ rows, onChange }: Props) {
    const update = (index: number, key: keyof EducationDetail, value: string) =>
        onChange(
            rows.map((row, i) =>
                i === index ? { ...row, [key]: value } : row,
            ),
        );

    return (
        <RepeatableSection
            title="Education"
            description="Provide the applicant's educational background."
            count={rows.length}
            addLabel="Add education"
            onAdd={() =>
                onChange([
                    ...rows,
                    {
                        institution_name: '',
                        qualification: '',
                        field_of_study: '',
                        start_year: '',
                        end_year: '',
                        notes: '',
                    },
                ])
            }
        >
            {rows.length === 0 ? (
                <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                    No education records added yet.
                </p>
            ) : (
                rows.map((row, index) => (
                    <RepeatableRow
                        key={index}
                        index={index}
                        title="Education"
                        columns="sm:grid-cols-2 lg:grid-cols-3"
                        onRemove={() =>
                            onChange(rows.filter((_, i) => i !== index))
                        }
                    >
                        <DetailInput
                            label="Institution"
                            value={row.institution_name}
                            onChange={(v) =>
                                update(index, 'institution_name', v)
                            }
                        />
                        <DetailInput
                            label="Qualification"
                            value={row.qualification}
                            onChange={(v) => update(index, 'qualification', v)}
                        />
                        <DetailInput
                            label="Field of study"
                            value={row.field_of_study}
                            onChange={(v) => update(index, 'field_of_study', v)}
                        />
                        <DetailInput
                            label="Start year"
                            type="number"
                            value={row.start_year}
                            onChange={(v) => update(index, 'start_year', v)}
                        />
                        <DetailInput
                            label="End year"
                            type="number"
                            value={row.end_year}
                            onChange={(v) => update(index, 'end_year', v)}
                        />
                        <DetailInput
                            label="Notes"
                            value={row.notes}
                            onChange={(v) => update(index, 'notes', v)}
                        />
                    </RepeatableRow>
                ))
            )}
        </RepeatableSection>
    );
}
