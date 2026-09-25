import { SidebarItem } from '../../types';
import { customerKycMenu } from './customerKycMenu';
import { financialServicesMenu } from './financialServicesMenu';
import { generalAccountingMenu } from './generalAccountingMenu';
import { homeMenu } from './homeMenu';
import { systemAdministrationMenu } from './systemAdministrationMenu';
import { treasuryAndCashMenu } from './treasuryAndCashMenu';

export const sidebarMenu: SidebarItem[] = [
    ...homeMenu,
    ...customerKycMenu,
    ...financialServicesMenu,
    // ...investmentMenu,
    // ...procurementMenu,
    // ...fixedAssetsMenu,
    // ...employeePayrollMenu,
    ...treasuryAndCashMenu,
    ...generalAccountingMenu,
    ...systemAdministrationMenu,
];
