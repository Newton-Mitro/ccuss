const statusConfig = {
    PENDING: {
        label: 'Pending',
        class: 'bg-yellow-100 text-yellow-800',
    },
    VERIFIED: {
        label: 'Verified',
        class: 'bg-blue-100 text-blue-800',
    },
    APPROVED: {
        label: 'Approved',
        class: 'bg-green-100 text-green-800',
    },
    REJECTED: {
        label: 'Rejected',
        class: 'bg-red-100 text-red-800',
    },
};

export default statusConfig;

export type StatusConfig = typeof statusConfig;

export type Status = keyof StatusConfig;

export type StatusClass = StatusConfig[Status]['class'];
