import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { FileText, Trash2, Upload } from 'lucide-react';
import { route } from 'ziggy-js';
import { SupportingDocument } from '@/modules/financial-services/loan-applications/types';
import RepeatableSection from '@/modules/financial-services/loan-applications/components/repeatable-section';
import type { Props } from '@/modules/financial-services/types/loan-applications/components/supporting-documents-section.types';


const documentOptions = [
    { value: '', label: 'Select document type' },
    { value: 'IDENTITY', label: 'Identity' },
    { value: 'INCOME', label: 'Income proof' },
    { value: 'BANK_STATEMENT', label: 'Bank statement' },
    { value: 'TAX', label: 'Tax document' },
    { value: 'OTHER', label: 'Other' },
];

export default function SupportingDocumentsSection({
    rows,
    onChange,
    existingDocuments = [],
    applicationId,
    canViewExisting,
    errors,
}: Props) {
    const update = (
        index: number,
        key: keyof SupportingDocument,
        value: string | File | null,
    ) =>
        onChange(
            rows.map((row, i) =>
                i === index ? { ...row, [key]: value } : row,
            ),
        );

    return (
        <RepeatableSection
            title="Supporting documents"
            description="Attach identity, income, bank, or other supporting files."
            count={rows.length}
            addLabel="Add document"
            onAdd={() => onChange([...rows, { document_type: '', file: null }])}
        >
            {canViewExisting && existingDocuments.length > 0 && (
                <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
                    <p className="text-xs font-semibold text-muted-foreground">
                        Previously uploaded
                    </p>
                    {existingDocuments.map((document) => (
                        <a
                            key={document.id}
                            className="flex items-center gap-2 text-sm text-primary underline-offset-4 hover:underline"
                            href={route(
                                'loan-applications.documents.download',
                                [applicationId, document.id],
                            )}
                        >
                            <FileText className="size-4 shrink-0" />
                            <span className="truncate">
                                {document.file_name}
                            </span>
                        </a>
                    ))}
                </div>
            )}

            {rows.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-4 py-7 text-center">
                    <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-muted">
                        <Upload className="size-4 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">
                        No new documents selected
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        PDF, JPG, PNG, DOC, or DOCX
                    </p>
                </div>
            ) : (
                rows.map((row, index) => (
                    <div
                        key={index}
                        className="grid gap-3 rounded-xl border bg-background p-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.5fr)_auto] sm:items-end"
                    >
                        <div className="min-w-0 space-y-1.5">
                            <Label className="text-xs text-muted-foreground">
                                Document type
                            </Label>
                            <Select
                                value={row.document_type}
                                onChange={(value) =>
                                    update(index, 'document_type', value)
                                }
                                options={documentOptions}
                            />
                        </div>
                        <div className="min-w-0 space-y-1.5">
                            <Label className="text-xs text-muted-foreground">
                                Choose file
                            </Label>
                            <Input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                className="h-9 text-xs file:mr-2 file:rounded file:border-0 file:bg-muted file:px-2 file:py-1"
                                onChange={(event) =>
                                    update(
                                        index,
                                        'file',
                                        event.target.files?.[0] ?? null,
                                    )
                                }
                            />
                            {row.file && (
                                <p className="truncate text-xs text-muted-foreground">
                                    {row.file.name}
                                </p>
                            )}
                        </div>
                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="size-9 text-muted-foreground hover:text-destructive"
                            aria-label="Remove document"
                            onClick={() =>
                                onChange(rows.filter((_, i) => i !== index))
                            }
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                ))
            )}
            <InputError message={errors.supporting_documents} />
        </RepeatableSection>
    );
}
