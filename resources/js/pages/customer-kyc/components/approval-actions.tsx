import { router } from '@inertiajs/react';
import { CheckCheck, XCircle } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { appSwal } from '../../../lib/appSwal';

interface ApprovalActionsProps {
    approveUrl: string;
    rejectUrl: string;
    pending: boolean;
}

export default function ApprovalActions({
    approveUrl,
    rejectUrl,
    pending,
}: ApprovalActionsProps) {
    if (!pending) {
        return null;
    }

    const handleApprove = () => {
        router.post(approveUrl, {}, { preserveScroll: true });
    };

    const handleReject = () => {
        appSwal
            .fire({
                title: 'Reject record?',
                input: 'textarea',
                inputPlaceholder: 'Rejection reason',
                inputValidator: (value) =>
                    value?.trim()
                        ? undefined
                        : 'A rejection reason is required.',
                showCancelButton: true,
                confirmButtonText: 'Reject',
                confirmButtonColor: '#dc2626',
            })
            .then((result) => {
                if (result.isConfirmed) {
                    router.post(
                        rejectUrl,
                        { rejection_reason: result.value },
                        { preserveScroll: true },
                    );
                }
            });
    };

    return (
        <div className="inline-flex shrink-0 items-center gap-1">
            <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-success"
                onClick={handleApprove}
                aria-label="Approve"
                title="Approve"
            >
                <CheckCheck className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-destructive"
                onClick={handleReject}
                aria-label="Reject"
                title="Reject"
            >
                <XCircle className="h-4 w-4" />
            </Button>
        </div>
    );
}
