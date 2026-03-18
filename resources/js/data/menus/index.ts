import { SidebarItem } from '../../types';
import { bankManagementMenu } from './bankManagement';
import { branchTreasuryManagementMenu } from './branchTreasuaryManagement';
import { customerManagementMenu } from './customerManagement';
import { depositManagementMenu } from './depositManagement';
import { financeAndAccountingMenu } from './financeAndAccounting';
import { fixedAssetManagementMenu } from './fixedAssetManagement';
import { hrManagementMenu } from './hrManagement';
import { inventoryManagementMenu } from './inventoryManagement';
import { loanManagementMenu } from './loanManagement';
import { pettyCashManagementMenu } from './pettyCashManagement';
import { procurementManagementMenu } from './procurementManagement';
import { settingsMenu } from './settings';
import { systemAdminMenu } from './systemAdmin';

export const sidebarMenu: SidebarItem[] = [
    ...systemAdminMenu,
    ...customerManagementMenu,
    ...depositManagementMenu,
    ...loanManagementMenu,
    ...branchTreasuryManagementMenu,
    ...pettyCashManagementMenu,
    ...bankManagementMenu,
    ...procurementManagementMenu,
    ...fixedAssetManagementMenu,
    ...inventoryManagementMenu,
    ...hrManagementMenu,
    ...financeAndAccountingMenu,
    ...settingsMenu,
];
