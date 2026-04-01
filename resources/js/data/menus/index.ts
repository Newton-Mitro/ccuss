import { SidebarItem } from '../../types';
import { bankAndChequeMenu } from './bankAndChequeMenu';
import { branchCashAndTreasuryMenu } from './branchCashAndTreasuaryMenu';
import { customerKycMenu } from './customerKycMenu';
import { dashboardMenu } from './dashboardMenu';
import { financeAndAccountingMenu } from './financeAndAccountingMenu';
import { loanManagementMenu } from './loanManagement';
import { pettyCashMenu } from './pettyCashMenu';
import { procurementMenu } from './procurementMenu';
import { savingDepositMenu } from './savingDepositMenu';
import { systemAdministrationMenu } from './systemAdministrationMenu';

export const sidebarMenu: SidebarItem[] = [
    ...dashboardMenu,
    ...customerKycMenu,
    ...savingDepositMenu,
    ...loanManagementMenu,
    ...branchCashAndTreasuryMenu,
    ...pettyCashMenu,
    ...bankAndChequeMenu,
    ...procurementMenu,
    // ...fixedAssetMenu,
    // ...hrAndPayrollMenu,
    ...financeAndAccountingMenu,
    ...systemAdministrationMenu,
];
