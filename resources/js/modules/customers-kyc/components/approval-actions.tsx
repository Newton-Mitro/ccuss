import { router } from '@inertiajs/react';
import { CheckCheck, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { appSwal } from '@/lib/appSwal';
import type { ApprovalActionsProps } from '@/modules/customers-kyc/types/components/approval-actions.interfaces';


export default function ApprovalActions({
    approveUrl,
    rejectUrl,
    pending,
    onSuccess,
    maxRejectionLength = 500,
}: ApprovalActionsProps) {
    if (!pending) {
        return null;
    }

    const submitDecision = async (action: 'approve' | 'reject') => {
        const confirmation = await appSwal.fire({
            title: action === 'approve' ? 'Approve record?' : 'Reject record?',
            text:
                action === 'approve'
                    ? 'This will mark the record as approved.'
                    : 'Provide a reason for rejecting this record.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: action === 'approve' ? 'Approve' : 'Reject',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
            ...(action === 'reject'
                ? {
                      input: 'textarea' as const,
                      inputLabel: 'Rejection reason',
                      inputPlaceholder: 'Enter rejection reason',
                      inputAttributes: {
                          maxlength: String(maxRejectionLength),
                      },
                      inputValidator: (value: string) =>
                          value.trim()
                              ? undefined
                              : 'A rejection reason is required.',
                  }
                : {}),
            showLoaderOnConfirm: true,
            allowOutsideClick: () => !appSwal.isLoading(),
            preConfirm: (value) =>
                new Promise<boolean>((resolve, reject) => {
                    router.post(
                        action === 'approve' ? approveUrl : rejectUrl,
                        action === 'reject'
                            ? { rejection_reason: String(value).trim() }
                            : {},
                        {
                            preserveScroll: true,
                            onSuccess: () => {
                                onSuccess?.();
                                resolve(true);
                            },
                            onError: (errors) =>
                                reject(
                                    errors.rejection_reason ??
                                        'The action could not be completed. Please try again.',
                                ),
                        },
                    );
                }),
        });

        return confirmation.isConfirmed;
    };

    return (
        <>
            <div className="inline-flex shrink-0 items-center gap-1">
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-success"
                    onClick={() => void submitDecision('approve')}
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
                    onClick={() => void submitDecision('reject')}
                    aria-label="Reject"
                    title="Reject"
                >
                    <XCircle className="h-4 w-4" />
                </Button>
            </div>

        </>
    );
}
