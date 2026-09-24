import { SidebarItem } from '../../types';

export const fixedAssetsMenu: SidebarItem[] = [
    {
        name: 'Fixed Assets',
        icon: <i className="fa-solid fa-building" />,
        permission: ['fixed_assets.view'],
        children_expanded: false,
        children: [
            {
                name: 'Asset Register',
                icon: <i className="fa-solid fa-list-check" />,
                path: '/fixed-assets',
                match_path: 'fixed-assets',
                permission: ['fixed_assets.view'],
            },
            {
                name: 'Asset Purchases',
                icon: <i className="fa-solid fa-truck-ramp-box" />,
                path: '/fixed-assets/purchases',
                match_path: 'fixed-assets/purchases',
                permission: ['fixed_assets.manage'],
            },
            {
                name: 'Depreciation',
                icon: <i className="fa-solid fa-chart-column" />,
                path: '/fixed-assets/depreciation',
                match_path: 'fixed-assets/depreciation',
                permission: ['fixed_assets.manage'],
            },
            {
                name: 'Transfers & Disposal',
                icon: <i className="fa-solid fa-arrow-right-arrow-left" />,
                path: '/fixed-assets/disposals',
                match_path: 'fixed-assets/disposals',
                permission: ['fixed_assets.manage'],
            },
        ],
    },
];
