import { SidebarItem } from '../../types';

export const assetManagementMenu: SidebarItem[] = [
    {
        name: 'Asset Management',
        icon: <i className="fa-solid fa-building-lock" />,
        children_expanded: false,
        permission: ['asset.view'],
        children: [
            {
                name: 'Fixed Assets',
                icon: <i className="fa-solid fa-building" />,
                path: '/fixed-assets',
                match_path: 'fixed-assets',
                permission: ['asset.fixed.view'],
            },
            {
                name: 'Depreciation',
                icon: <i className="fa-solid fa-chart-area" />,
                path: '/depreciation',
                match_path: 'depreciation',
                permission: ['asset.depreciation.view'],
            },
        ],
    },
];
