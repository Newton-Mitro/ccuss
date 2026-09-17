import { SidebarItem } from '../../types';
import { customerKycMenu } from './customerKycMenu';
import { financialServicesMenu } from './financialServicesMenu';
import { generalAccountingMenu } from './generalAccountingMenu';
import { homeMenu } from './homeMenu';
import { systemAdministrationMenu } from './systemAdministrationMenu';

export const sidebarMenu: SidebarItem[] = [
    ...homeMenu,
    ...customerKycMenu,
    ...financialServicesMenu,
    ...generalAccountingMenu,
    ...systemAdministrationMenu,
];
