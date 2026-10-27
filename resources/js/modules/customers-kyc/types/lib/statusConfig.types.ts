export type StatusConfig =
    typeof import('@/modules/customers-kyc/lib/statusConfig').default;

export type Status = keyof StatusConfig;

export type StatusClass = StatusConfig[Status]['class'];
