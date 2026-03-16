import { SidebarItem } from '../../types';
import { assetManagementMenu } from './assetManagement';
import { auditMenu } from './audit';
import { bankManagementMenu } from './bankManagement';
import { branchTreasuryManagementMenu } from './branchTreasuaryManagement';
import { customerManagementMenu } from './customerManagement';
import { depositManagementMenu } from './depositManagement';
import { financeAndAccountingMenu } from './financeAndAccounting';
import { loanManagementMenu } from './loanManagement';
import { payrollMenu } from './payroll';
import { pettyCashManagementMenu } from './pettyCashManagement';
import { reportsMenu } from './reports';
import { settingsMenu } from './settings';
import { systemAdminMenu } from './systemAdmin';
import { transactionManagementMenu } from './transactionManagement';

export const sidebarMenu: SidebarItem[] = [
    ...systemAdminMenu,
    ...customerManagementMenu,
    ...depositManagementMenu,
    ...loanManagementMenu,
    ...transactionManagementMenu,
    ...branchTreasuryManagementMenu,
    ...pettyCashManagementMenu,
    ...bankManagementMenu,
    ...financeAndAccountingMenu,
    ...assetManagementMenu,
    ...payrollMenu,
    ...reportsMenu,
    ...auditMenu,
    ...settingsMenu,
];
