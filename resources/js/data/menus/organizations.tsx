import { SidebarItem } from '../../types';

export const organizatoins: SidebarItem[] = [
    {
        name: 'Organization',
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
            {
                name: 'Period End',
                icon: <i className="fa-solid fa-lock" />,
                children_expanded: false,
                permission: ['accounting.period_end.view'],
                children: [
                    {
                        name: 'Close Period',
                        icon: <i className="fa-solid fa-lock" />,
                        path: '/period-end/close',
                        match_path: 'period-end/close',
                        permission: ['accounting.period_end.close'],
                    },
                    {
                        name: 'Reopen Period',
                        icon: <i className="fa-solid fa-lock-open" />,
                        path: '/period-end/reopen',
                        match_path: 'period-end/reopen',
                        permission: ['accounting.period_end.reopen'],
                    },
                    {
                        name: 'Year-End Closing',
                        icon: <i className="fa-solid fa-calendar-check" />,
                        path: '/period-end/year-end-closing',
                        match_path: 'period-end/year-end-closing',
                        permission: ['accounting.year_end.close'],
                    },
                ],
            },
        ],
    },
];
