import { SidebarItem } from '@/types';

export const organizatoins: SidebarItem[] = [
    {
        name: 'Organizations',
        icon: <i className="fa-solid fa-building-wheat" />,
        path: '/organizations',
        match_path: 'organizations',
        permission: ['organizations.view'],
    },
];
