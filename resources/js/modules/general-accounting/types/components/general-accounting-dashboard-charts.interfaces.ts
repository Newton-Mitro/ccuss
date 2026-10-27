export interface GeneralAccountingDashboardChartsProps {
    dailyVoucherActivity: { date: string; label: string; posted: number }[];
    voucherStatusBreakdown: { status: string; count: number }[];
}
