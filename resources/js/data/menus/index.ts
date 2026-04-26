import { SidebarItem } from '../../types';
import { bankCashModuleMenu } from './bankCashModuleMenu';
import { cashAndTreasuryMenu } from './cashAndTreasuryMenu';
import { chequeManagementMenu } from './chequeManagementMenu';
import { customerKycMenu } from './customerKycMenu';
import { depositModuleMenu } from './depositModuleMenu';
import { generalAccountingMenu } from './generalAccountingMenu';
import { homeMenu } from './homeMenu';
import { hrAndPayrollMenu } from './hrAndPayrollMenu';
import { loanManagementMenu } from './loanManagement';
import { pettyCashMenu } from './pettyCashMenu';
import { subledgerModuleMenu } from './subledgerModuleMenu';
import { systemAdministrationMenu } from './systemAdministrationMenu';

export const sidebarMenu: SidebarItem[] = [
    ...homeMenu,
    ...customerKycMenu,
    ...subledgerModuleMenu,
    ...depositModuleMenu,
    ...loanManagementMenu,
    ...cashAndTreasuryMenu,
    ...bankCashModuleMenu,
    ...pettyCashMenu,
    // ...procurementMenu,
    // ...fixedAssetMenu,
    ...chequeManagementMenu,
    ...hrAndPayrollMenu,
    ...generalAccountingMenu,
    ...systemAdministrationMenu,
];
