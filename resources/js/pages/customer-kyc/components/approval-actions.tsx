import { router } from '@inertiajs/react';
import { CheckCheck, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';

interface ApprovalActionsProps {
    approveUrl: string;
    rejectUrl: string;
    pending: boolean;
    onSuccess?: () => void;
    maxRejectionLength?: number;
}

export default function ApprovalActions({
    approveUrl,
    rejectUrl,
    pending,
    onSuccess,
    maxRejectionLength = 500,
}: ApprovalActionsProps) {
    const [confirmation, setConfirmation] = useState<
        'approve' | 'reject' | null
    >(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);

    if (!pending) {
        return null;
    }

    const openConfirmation = (action: 'approve' | 'reject') => {
        setError('');
        setConfirmation(action);
    };

    const closeConfirmation = (open: boolean) => {
        if (processing || open) return;
        setConfirmation(null);
        setError('');
    };

    const submitDecision = () => {
        if (!confirmation || processing) return;
        if (confirmation === 'reject' && !rejectionReason.trim()) {
            setError('A rejection reason is required.');
            return;
        }

        setProcessing(true);
        setError('');
        router.post(
            confirmation === 'approve' ? approveUrl : rejectUrl,
            confirmation === 'reject'
                ? { rejection_reason: rejectionReason.trim() }
                : {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setConfirmation(null);
                    onSuccess?.();
                },
                onError: (errors) => {
                    setError(
                        errors.rejection_reason ??
                            'The action could not be completed. Please try again.',
                    );
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <>
            <div className="inline-flex shrink-0 items-center gap-1">
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-success"
                    onClick={() => openConfirmation('approve')}
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
                    onClick={() => openConfirmation('reject')}
                    aria-label="Reject"
                    title="Reject"
                >
                    <XCircle className="h-4 w-4" />
                </Button>
            </div>

            <Dialog
                open={confirmation !== null}
                onOpenChange={closeConfirmation}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {confirmation === 'approve'
                                ? 'Approve record?'
                                : 'Reject record?'}
                        </DialogTitle>
                        <DialogDescription>
                            {confirmation === 'approve'
                                ? 'This will mark the record as approved.'
                                : 'Provide a reason for rejecting this record.'}
                        </DialogDescription>
                    </DialogHeader>

                    {confirmation === 'reject' && (
                        <div className="space-y-2">
                            <Label htmlFor="rejection-reason">
                                Rejection reason
                            </Label>
                            <textarea
                                id="rejection-reason"
                                value={rejectionReason}
                                onChange={(event) => {
                                    setRejectionReason(event.target.value);
                                    if (error) setError('');
                                }}
                                placeholder="Enter rejection reason"
                                rows={4}
                                maxLength={maxRejectionLength}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                                autoFocus
                            />
                        </div>
                    )}

                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={processing}
                            onClick={() => closeConfirmation(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant={
                                confirmation === 'reject'
                                    ? 'destructive'
                                    : 'default'
                            }
                            disabled={processing}
                            onClick={submitDecision}
                        >
                            {processing
                                ? 'Processing...'
                                : confirmation === 'approve'
                                  ? 'Approve'
                                  : 'Reject'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
