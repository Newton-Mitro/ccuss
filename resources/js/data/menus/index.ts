import { SidebarItem } from '../../types';
import { bankCashModuleMenu } from './bankCashModuleMenu';
import { branchCashAndTreasuryMenu } from './branchCashAndTreasuryMenu';
import { chequeManagementMenu } from './chequeManagementMenu';
import { customerKycMenu } from './customerKycMenu';
import { dashboardMenu } from './dashboardMenu';
import { depositModuleMenu } from './depositModuleMenu';
import { financeAndAccountingMenu } from './financeAndAccountingMenu';
import { pettyCashMenu } from './pettyCashMenu';
import { systemAdministrationMenu } from './systemAdministrationMenu';

export const sidebarMenu: SidebarItem[] = [
    ...dashboardMenu,
    ...customerKycMenu,
    ...depositModuleMenu,
    // ...loanManagementMenu,
    ...branchCashAndTreasuryMenu,
    ...bankCashModuleMenu,
    ...pettyCashMenu,
    // ...procurementMenu,
    // ...fixedAssetMenu,
    ...chequeManagementMenu,
    // ...hrAndPayrollMenu,
    ...financeAndAccountingMenu,
    ...systemAdministrationMenu,
];
