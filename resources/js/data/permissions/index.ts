import { assetManagementPermissions } from './assetManagement';
import { auditPermissions } from './audit';
import { bankManagementPermissions } from './bankManagement';
import { branchCashManagementPermissions } from './branchCashManagement';
import { customerManagementPermissions } from './customerManagement';
import { depositManagementPermissions } from './depositManagement';
import { financeAndAccountingPermissions } from './financeAndAccounting';
import { loanManagementPermissions } from './loanManagement';
import { payrollPermissions } from './payroll';
import { pettyCashManagementPermissions } from './pettyCashManagement';
import { reportsPermissions } from './reports';
import { settingsPermissions } from './settings';
import { systemAdminPermissions } from './systemAdmin';
import { transactionManagementPermissions } from './transactionManagement';

export const sidebarMenuPermissions: string[] = [
    ...systemAdminPermissions,
    ...customerManagementPermissions,
    ...depositManagementPermissions,
    ...loanManagementPermissions,
    ...transactionManagementPermissions,
    ...branchCashManagementPermissions,
    ...pettyCashManagementPermissions,
    ...bankManagementPermissions,
    ...financeAndAccountingPermissions,
    ...assetManagementPermissions,
    ...payrollPermissions,
    ...reportsPermissions,
    ...auditPermissions,
    ...settingsPermissions,
];
