import { route } from 'ziggy-js';
import { SidebarItem } from '../../types';
import { administrationAndSecurity } from './administration-and-security';
import { auditAndCompliance } from './audit-and-compliance';
import { branchOperations } from './branch-operations';
import { customerAndKYC } from './customer-and-kyc';
import { generalAccounting } from './general-accounting';
import { organizatoins } from './organizations';
import { financialServices } from './product-and-subledgers';
import { treasuryAndCash } from './treasury-and-cash';

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
