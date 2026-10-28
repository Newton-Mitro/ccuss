import { SidebarItem } from '@/types';

export const organizatoins: SidebarItem[] = [
    {
        name: 'Organization & Settings',
        icon: <i className="fa-solid fa-building-wheat" />,
        permission: ['organizations.view'],
        children_expanded: false,
        children: [
            {
                name: 'Organizations',
                icon: <i className="fa-solid fa-building" />,
                path: '/organizations',
                match_path: 'organizations',
                permission: ['organizations.view'],
            },
        ],
    },
];
