export interface BranchOperationsChartsProps {
    dailyPostedAmounts: { date: string; label: string; amount: number }[];
    transactionTypes: { type: string; count: number }[];
}
