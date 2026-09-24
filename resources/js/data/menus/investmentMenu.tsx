import { SidebarItem } from '../../types';

export const investmentMenu: SidebarItem[] = [
    {
        name: 'Investments',
        icon: <i className="fa-solid fa-chart-line" />,
        permission: ['investments.view'],
        children_expanded: false,
        children: [
            {
                name: 'Investment Portfolio',
                icon: <i className="fa-solid fa-briefcase" />,
                path: '/investments',
                match_path: 'investments',
                permission: ['investments.view'],
            },
            {
                name: 'Term Investments / FDR',
                icon: <i className="fa-solid fa-vault" />,
                path: '/investments/term-deposits',
                match_path: 'investments/term-deposits',
                permission: ['investments.view'],
            },
            {
                name: 'Investment Purchases',
                icon: <i className="fa-solid fa-arrow-trend-up" />,
                path: '/investments/purchases',
                match_path: 'investments/purchases',
                permission: ['investments.manage'],
            },
            {
                name: 'Investment Sales & Maturity',
                icon: <i className="fa-solid fa-money-bill-transfer" />,
                path: '/investments/realizations',
                match_path: 'investments/realizations',
                permission: ['investments.manage'],
            },
        ],
    },
];
