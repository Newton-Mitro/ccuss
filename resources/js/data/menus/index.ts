import { SidebarItem } from '../../types';
import { customerKycMenu } from './customerKycMenu';
import { employeePayrollMenu } from './employeePayrollMenu';
import { financialServicesMenu } from './financialServicesMenu';
import { fixedAssetsMenu } from './fixedAssetsMenu';
import { generalAccountingMenu } from './generalAccountingMenu';
import { homeMenu } from './homeMenu';
import { investmentMenu } from './investmentMenu';
import { procurementMenu } from './procurementMenu';
import { systemAdministrationMenu } from './systemAdministrationMenu';
import { treasuryAndCashMenu } from './treasuryAndCashMenu';

export const sidebarMenu: SidebarItem[] = [
    ...homeMenu,
    ...customerKycMenu,
    ...financialServicesMenu,
    ...investmentMenu,
    ...procurementMenu,
    ...fixedAssetsMenu,
    ...employeePayrollMenu,
    ...treasuryAndCashMenu,
    ...generalAccountingMenu,
    ...systemAdministrationMenu,
];
