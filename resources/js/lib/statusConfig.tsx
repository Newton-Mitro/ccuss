const statusConfig = {
    pending: {
        label: 'Pending',
        class: 'bg-warning text-warning-foreground',
    },
    active: {
        label: 'active',
        class: 'bg-success text-success-foreground',
    },
    inactive: {
        label: 'inactive',
        class: 'bg-destructive text-destructive-foreground',
    },
    suspended: {
        label: 'suspended',
        class: 'bg-destructive text-destructive-foreground',
    },
    closed: {
        label: 'closed',
        class: 'bg-destructive text-destructive-foreground',
    },
    verified: {
        label: 'verified',
        class: 'bg-success text-success-foreground',
    },
    rejected: {
        label: 'rejected',
        class: 'bg-success text-success-foreground',
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
                config?.class ?? 'bg-gray-100 text-gray-800'
            }`}
        >
            {config?.label ?? text}
        </span>
    );
};

export { Badge };
