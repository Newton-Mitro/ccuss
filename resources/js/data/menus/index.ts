import { SidebarItem } from '../../types';
import { auditAndCompliance } from './audit-and-compliance';
import { creditAndRecovery } from './credit-and-recovery';
import { customerKycMenu } from './customerKycMenu';
import { depositAccounts } from './deposit-accounts';
import { generalAccountingMenu } from './generalAccountingMenu';
import { homeMenu } from './homeMenu';
import { productAndSubledgers } from './product-and-subledgers';
import { systemAdministration } from './system-administration';
import { treasuryAndCashMenu } from './treasuryAndCashMenu';

export const sidebarMenu: SidebarItem[] = [
    ...homeMenu,
    ...customerKycMenu,
    ...productAndSubledgers,
    ...depositAccounts,
    ...creditAndRecovery,
    // ...investmentMenu,
    // ...procurementMenu,
    // ...fixedAssetsMenu,
    // ...employeePayrollMenu,
    ...treasuryAndCashMenu,
    ...generalAccountingMenu,
    ...auditAndCompliance,
    ...systemAdministration,
];
