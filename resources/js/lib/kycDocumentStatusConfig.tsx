import { CheckCircle2, Clock, XCircle } from 'lucide-react';

const kycDocumentStatusConfig = {
    PENDING: {
        label: 'Pending',
        class: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
        iconClass: 'text-yellow-600',
    },
    VERIFIED: {
        label: 'Verified',
        class: 'bg-blue-100 text-blue-800',
        icon: CheckCircle2,
        iconClass: 'text-green-600',
    },
    APPROVED: {
        label: 'Approved',
        class: 'bg-green-100 text-green-800',
        icon: CheckCircle2,
        iconClass: 'text-green-600',
    },
    REJECTED: {
        label: 'Rejected',
        class: 'bg-red-100 text-red-800',
        icon: XCircle,
        iconClass: 'text-red-600',
    },
};

export default kycDocumentStatusConfig;
