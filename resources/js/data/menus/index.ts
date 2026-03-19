import { SidebarItem } from '../../types';
import { bankAndChequeMenu } from './bankAndChequeMenu';
import { branchCashAndTreasuryMenu } from './branchCashAndTreasuaryMenu';
import { customerKycMenu } from './customerKycMenu';
import { financeAndAccountingMenu } from './financeAndAccountingMenu';
import { fixedAssetMenu } from './fixedAssetMenu';
import { hrAndPayrollMenu } from './hrAndPayrollMenu';
import { loanManagementMenu } from './loanManagement';
import { pettyCashMenu } from './pettyCashMenu';
import { procurementMenu } from './procurementMenu';
import { savingDepositMenu } from './savingDepositMenu';
import { systemAdministrationMenu } from './systemAdministrationMenu';

export const sidebarMenu: SidebarItem[] = [
    ...customerKycMenu,
    ...savingDepositMenu,
    ...loanManagementMenu,
    ...branchCashAndTreasuryMenu,
    ...pettyCashMenu,
    ...bankAndChequeMenu,
    ...procurementMenu,
    ...fixedAssetMenu,
    ...hrAndPayrollMenu,
    ...financeAndAccountingMenu,
    ...systemAdministrationMenu,
];
