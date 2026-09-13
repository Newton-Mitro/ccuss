import { Customer } from './customer_kyc_module';

interface BranchOrganization {
    id: number;
    name: string;
}

export interface Branch {
    id: number;
    organization_id: number;

    code: string; // Unique branch code
    name: string; // Branch name
    address?: string | null; // Optional full address

    latitude?: number | null; // Optional GPS latitude
    longitude?: number | null; // Optional GPS longitude

    manager_id?: number | null; // Foreign key (users.id)
    manager?: Customer | null;
    organization?: BranchOrganization | null;

    created_at: string; // ISO date string
    updated_at: string; // ISO date string
}
