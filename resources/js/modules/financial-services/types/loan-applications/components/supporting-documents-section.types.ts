import {
    FormErrors,
    SupportingDocument,
} from '@/modules/financial-services/loan-applications/types';

export type ExistingDocument = { id: number | string; file_name: string };

export type Props = {
    rows: SupportingDocument[];
    onChange: (rows: SupportingDocument[]) => void;
    existingDocuments?: ExistingDocument[];
    applicationId?: number | string;
    canViewExisting: boolean;
    errors: FormErrors;
};
