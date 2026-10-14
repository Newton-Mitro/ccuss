import { AssetDetail } from '../types';
import DetailInput from './detail-input';
import RepeatableRow from './repeatable-row';
import RepeatableSection from './repeatable-section';

type Props = { rows: AssetDetail[]; onChange: (rows: AssetDetail[]) => void };

export default function AssetDetailsSection({ rows, onChange }: Props) {
    const update = (index: number, key: keyof AssetDetail, value: string) =>
        onChange(
            rows.map((row, i) =>
                i === index ? { ...row, [key]: value } : row,
            ),
        );

    return (
        <RepeatableSection
            title="Assets"
            description="List assets that may support the applicant's financial profile."
            count={rows.length}
            addLabel="Add asset"
            onAdd={() =>
                onChange([
                    ...rows,
                    {
                        asset_type: '',
                        description: '',
                        estimated_value: '',
                        ownership_status: '',
                        notes: '',
                    },
                ])
            }
        >
            {rows.length === 0 ? (
                <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                    No assets added yet.
                </p>
            ) : (
                rows.map((row, index) => (
                    <RepeatableRow
                        key={index}
                        index={index}
                        title="Asset"
                        columns="sm:grid-cols-2 lg:grid-cols-3"
                        onRemove={() =>
                            onChange(rows.filter((_, i) => i !== index))
                        }
                    >
                        <DetailInput
                            label="Asset type"
                            value={row.asset_type}
                            placeholder="Property, vehicle..."
                            onChange={(v) => update(index, 'asset_type', v)}
                        />
                        <DetailInput
                            label="Description"
                            value={row.description}
                            onChange={(v) => update(index, 'description', v)}
                        />
                        <DetailInput
                            label="Estimated value (৳)"
                            type="number"
                            value={row.estimated_value}
                            onChange={(v) =>
                                update(index, 'estimated_value', v)
                            }
                        />
                        <DetailInput
                            label="Ownership status"
                            value={row.ownership_status}
                            placeholder="Owned, financed..."
                            onChange={(v) =>
                                update(index, 'ownership_status', v)
                            }
                        />
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
