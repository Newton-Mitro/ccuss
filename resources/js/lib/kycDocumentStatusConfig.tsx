import { CheckCircle2, Clock, XCircle } from 'lucide-react';

const kycDocumentStatusConfig = {
    pending: {
        label: 'Pending',
        class: 'bg-warning text-warning-foreground',
        icon: Clock,
        iconClass: 'text-warning',
    },
    verified: {
        label: 'Verified',
        class: 'bg-success text-success-foreground',
        icon: CheckCircle2,
        iconClass: 'text-success',
    },
    approved: {
        label: 'Approved',
        class: 'bg-info text-info-foreground',
        icon: CheckCircle2,
        iconClass: 'text-info',
    },
    rejected: {
        label: 'Rejected',
        class: 'bg-destructive text-destructive-foreground',
        icon: XCircle,
        iconClass: 'text-destructive',
    },
};

export default kycDocumentStatusConfig;
