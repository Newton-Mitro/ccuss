export interface CustomerDashboardChartsProps {
    charts: {
        demographics: {
            male: number;
            female: number;
            other: number;
            organization: number;
        };
        statuses: {
            active: number;
            pending: number;
            inactive: number;
            suspended: number;
            closed: number;
        };
        pendingApprovals: {
            customers: number;
            addresses: number;
            familyRelations: number;
            introducers: number;
            documents: number;
        };
    };
}
