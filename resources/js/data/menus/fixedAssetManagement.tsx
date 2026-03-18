import { SidebarItem } from '../../types';

export const fixedAssetManagementMenu: SidebarItem[] = [
    {
        name: 'Fixed Assets',
        icon: <i className="fa-solid fa-building-columns" />,
        children_expanded: false,
        permission: ['asset.view'],
        children: [
            {
                name: 'Asset Categories',
                icon: <i className="fa-solid fa-tags" />,
                path: '/asset-categories',
                match_path: 'asset-categories',
                permission: ['asset.category.view'],
            },
            {
                name: 'Assets',
                icon: <i className="fa-solid fa-boxes" />,
                path: '/assets',
                match_path: 'assets',
                permission: ['asset.view'],
            },
            {
                name: 'Asset Assignments',
                icon: <i className="fa-solid fa-user-tag" />,
                path: '/asset-assignments',
                match_path: 'asset-assignments',
                permission: ['asset.assignment.view'],
            },
            {
                name: 'Asset Depreciation',
                icon: <i className="fa-solid fa-calculator" />,
                path: '/asset-depreciation',
                match_path: 'asset-depreciation',
                permission: ['asset.depreciation.view'],
            },
            {
                name: 'Asset Disposal',
                icon: <i className="fa-solid fa-dumpster-fire" />,
                path: '/asset-disposals',
                match_path: 'asset-disposals',
                permission: ['asset.disposal.view'],
            },
        ],
    },
];
