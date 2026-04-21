import { SidebarItem } from '../../types';

export const customerAccountMenu: SidebarItem[] = [
    {
        name: 'Customer Accounts',
        icon: <i className="fa-solid fa-users" />,
        path: '/customer-accounts',
        match_path: 'customer-accounts',
        permission: ['customer-accounts.view'],
    },
];
