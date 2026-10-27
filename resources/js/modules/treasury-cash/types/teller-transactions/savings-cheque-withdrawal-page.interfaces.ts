export interface SignatureOption {
    key: string;
    name: string;
    detail: string;
    signature: {
        url: string;
        verification_status: string;
    } | null;
}
