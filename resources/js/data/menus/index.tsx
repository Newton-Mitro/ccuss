import { administrationAndSecurity } from '@/modules/administration-security/menu';
import { auditAndCompliance } from '@/modules/audit-compliance/menu';
import { branchOperations } from '@/modules/branch-operations/menu';
import { customerAndKYC } from '@/modules/customers-kyc/menu';
import { financialServices } from '@/modules/financial-services/menu';
import { generalAccounting } from '@/modules/general-accounting/menu';
import { organizatoins } from '@/modules/organization-settings/menu';
import { treasuryAndCash } from '@/modules/treasury-cash/menu';
import type { SidebarItem } from '@/types';
import { route } from 'ziggy-js';

export const sidebarMenu: SidebarItem[] = [
    {
        name: 'Dashboard',
        icon: <i className="fa-solid fa-house" />,
        path: route('dashboard'),
        match_path: 'dashboard',
    },
    ...organizatoins,
    ...customerAndKYC,
    ...financialServices,
    ...branchOperations,
    ...treasuryAndCash,
    ...generalAccounting,
    ...auditAndCompliance,
    ...administrationAndSecurity,
];
