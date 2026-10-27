import { SharedData } from '@/types';

export interface CustomerKycDashboardProps extends SharedData {
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
    stats: {
        customers: number;
        activeCustomers: number;
        pendingCustomers: number;
        pendingAddresses: number;
        pendingFamilyRelations: number;
        pendingIntroducers: number;
        pendingDocuments: number;
    };
}
