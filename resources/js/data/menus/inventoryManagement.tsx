import { SidebarItem } from '../../types';

export const inventoryManagementMenu: SidebarItem[] = [
    {
        name: 'Inventory',
        icon: <i className="fa-solid fa-boxes-packing" />,
        children_expanded: false,
        permission: ['inventory.view'],
        children: [
            {
                name: 'Stock Items',
                icon: <i className="fa-solid fa-boxes" />,
                path: '/stock-items',
                match_path: 'stock-items',
                permission: ['stock.items.view'],
            },
            {
                name: 'Stock Categories',
                icon: <i className="fa-solid fa-tags" />,
                path: '/stock-categories',
                match_path: 'stock-categories',
                permission: ['stock.category.view'],
            },
            {
                name: 'Stock Transactions',
                icon: <i className="fa-solid fa-exchange-alt" />,
                path: '/stock-journal_entries',
                match_path: 'stock-journal_entries',
                permission: ['stock.journal_entries.view'],
            },
            {
                name: 'Stock Adjustments',
                icon: <i className="fa-solid fa-pen-to-square" />,
                path: '/stock-adjustments',
                match_path: 'stock-adjustments',
                permission: ['stock.adjustment.view'],
            },
        ],
    },
];
