import { route } from 'ziggy-js';
import { SidebarItem } from '../../types';
import { administrationAndSecurity } from './administration-and-security';
import { auditAndCompliance } from './audit-and-compliance';
import { branchOperations } from './branch-operations';
import { creditAndRecovery } from './credit-and-recovery';
import { customerAndKYC } from './customer-and-kyc';
import { depositAccounts } from './deposit-accounts';
import { generalAccounting } from './general-accounting';
import { organizatoins } from './organizations';
import { productAndSubledgers } from './product-and-subledgers';
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
    ...productAndSubledgers,
    ...depositAccounts,
    ...creditAndRecovery,
    ...branchOperations,
    ...treasuryAndCash,
    ...generalAccounting,
    ...auditAndCompliance,
    ...administrationAndSecurity,
];
