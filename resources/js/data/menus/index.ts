import { SidebarItem } from '../../types';
import { bankAndChequeMenu } from './bankAndChequeMenu';
import { branchCashAndTreasuryMenu } from './branchCashAndTreasuryMenu';
import { customerKycMenu } from './customerKycMenu';
import { dashboardMenu } from './dashboardMenu';
import { financeAndAccountingMenu } from './financeAndAccountingMenu';
import { pettyCashMenu } from './pettyCashMenu';
import { savingDepositMenu } from './savingDepositMenu';
import { systemAdministrationMenu } from './systemAdministrationMenu';

export const sidebarMenu: SidebarItem[] = [
    ...dashboardMenu,
    ...customerKycMenu,
    ...savingDepositMenu,
    // ...loanManagementMenu,
    ...branchCashAndTreasuryMenu,
    ...bankAndChequeMenu,
    ...pettyCashMenu,
    // ...procurementMenu,
    // ...fixedAssetMenu,
    // ...hrAndPayrollMenu,
    ...financeAndAccountingMenu,
    ...systemAdministrationMenu,
];
