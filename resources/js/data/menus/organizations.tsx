import { SidebarItem } from '../../types';

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
            {
                name: 'Fiscal Years',
                icon: <i className="fa-solid fa-calendar" />,
                path: '/fiscal-years',
                match_path: 'fiscal-years',
                permission: ['settings.fiscal_year.view'],
            },
            {
                name: 'Fiscal Periods',
                icon: <i className="fa-solid fa-calendar-days" />,
                path: '/fiscal-periods',
                match_path: 'fiscal-periods',
                permission: ['settings.fiscal.view'],
            },
        ],
    },
];
