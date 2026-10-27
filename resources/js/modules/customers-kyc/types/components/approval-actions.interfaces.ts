export interface ApprovalActionsProps {
    approveUrl: string;
    rejectUrl: string;
    pending: boolean;
    onSuccess?: () => void;
    maxRejectionLength?: number;
}
