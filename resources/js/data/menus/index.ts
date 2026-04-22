import { SidebarItem } from '../../types';
import { bankCashModuleMenu } from './bankCashModuleMenu';
import { cashAndTreasuryMenu } from './cashAndTreasuryMenu';
import { chequeManagementMenu } from './chequeManagementMenu';
import { customerAccountMenu } from './customerAccountMenu';
import { customerKycMenu } from './customerKycMenu';
import { depositModuleMenu } from './depositModuleMenu';
import { fixedAssetMenu } from './fixedAssetMenu';
import { generalAccountingMenu } from './generalAccountingMenu';
import { homeMenu } from './homeMenu';
import { hrAndPayrollMenu } from './hrAndPayrollMenu';
import { loanManagementMenu } from './loanManagement';
import { pettyCashMenu } from './pettyCashMenu';
import { procurementMenu } from './procurementMenu';
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
    ...customerAccountMenu,
    ...procurementMenu,
    ...fixedAssetMenu,
    ...chequeManagementMenu,
    ...hrAndPayrollMenu,
    ...generalAccountingMenu,
    ...systemAdministrationMenu,
];
