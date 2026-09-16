import { SidebarItem } from '../../types';
import { chequeManagementMenu } from './chequeManagementMenu';
import { customerKycMenu } from './customerKycMenu';
import { generalAccountingMenu } from './generalAccountingMenu';
import { homeMenu } from './homeMenu';
import { systemAdministrationMenu } from './systemAdministrationMenu';

export const sidebarMenu: SidebarItem[] = [
    ...homeMenu,
    ...customerKycMenu,
    ...chequeManagementMenu,
    ...generalAccountingMenu,
    ...systemAdministrationMenu,
];
