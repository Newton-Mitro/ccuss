import { CheckCircle2, Clock, XCircle } from 'lucide-react';

const kycDocumentStatusConfig = {
    PENDING: {
        label: 'Pending',
        class: 'bg-warning text-warning-foreground',
        icon: Clock,
        iconClass: 'text-warning',
    },
    VERIFIED: {
        label: 'Verified',
        class: 'bg-success text-success-foreground',
        icon: CheckCircle2,
        iconClass: 'text-success',
    },
    APPROVED: {
        label: 'Approved',
        class: 'bg-info text-info-foreground',
        icon: CheckCircle2,
        iconClass: 'text-info',
    },
    REJECTED: {
        label: 'Rejected',
        class: 'bg-destructive text-destructive-foreground',
        icon: XCircle,
        iconClass: 'text-destructive',
    },
};

export default kycDocumentStatusConfig;
