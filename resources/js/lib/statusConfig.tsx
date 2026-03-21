const statusConfig = {
    PENDING: {
        label: 'Pending',
        class: 'bg-warning text-warning-foreground',
    },
    VERIFIED: {
        label: 'Verified',
        class: 'bg-info text-info-foreground',
    },
    APPROVED: {
        label: 'Approved',
        class: 'bg-success text-success-foreground',
    },
    REJECTED: {
        label: 'Rejected',
        class: 'bg-destructive text-destructive-foreground',
    },
};

export default statusConfig;

export type StatusConfig = typeof statusConfig;

export type Status = keyof StatusConfig;

export type StatusClass = StatusConfig[Status]['class'];

const Badge = ({ text }: { text: Status }) => {
    const config = statusConfig[text];

    return (
        <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                config?.class ??
                'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
            }`}
        >
            {config?.label ?? text}
        </span>
    );
};

export { Badge };
