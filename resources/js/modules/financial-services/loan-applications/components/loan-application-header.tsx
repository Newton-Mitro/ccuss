import HeadingSmall from '@/components/heading-small';
import type { Props } from '@/modules/financial-services/types/loan-applications/components/loan-application-header.types';
import { ClipboardList, FilePenLine } from 'lucide-react';

export default function LoanApplicationHeader({
    applicationNo,
    isEditing,
}: Props) {
    return (
        <div className="space-y-3">
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                <HeadingSmall
                    title={
                        isEditing
                            ? 'Edit loan application'
                            : 'New loan application'
                    }
                    description={
                        isEditing
                            ? `${applicationNo ?? 'Draft application'} · Update the details before submitting for review.`
                            : 'Create a draft loan request with the applicant’s financial and supporting information.'
                    }
                />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5">
                    {isEditing ? (
                        <FilePenLine className="size-3.5" />
                    ) : (
                        <ClipboardList className="size-3.5" />
                    )}
                    {isEditing ? 'Draft in progress' : 'New application'}
                </span>
                <span>
                    Fields marked{' '}
                    <span className="font-semibold text-destructive">*</span>{' '}
                    are required.
                </span>
            </div>
        </div>
    );
}
