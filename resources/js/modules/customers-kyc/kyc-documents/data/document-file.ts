export const KYC_DOCUMENT_MAX_FILE_SIZE = 10 * 1024 * 1024;
export const KYC_DOCUMENT_ACCEPT =
    '.jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf';

const supportedMimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    pdf: 'application/pdf',
};

export function validateKycDocumentFile(file: File): string | null {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const expectedMimeType = extension ? supportedMimeTypes[extension] : null;

    if (
        !expectedMimeType ||
        (file.type !== '' && file.type !== expectedMimeType)
    ) {
        return 'Choose a JPG, PNG, or PDF document.';
    }

    if (file.size > KYC_DOCUMENT_MAX_FILE_SIZE) {
        return 'The document must be 10 MB or smaller.';
    }

    return null;
}
