import { SidebarItem } from '../../types';

export const procurementMenu: SidebarItem[] = [
    {
        name: 'Procurement & Vendors',
        icon: <i className="fa-solid fa-cart-shopping" />,
        permission: ['procurement.view'],
        children_expanded: false,
        children: [
            {
                name: 'Vendor Directory',
                icon: <i className="fa-solid fa-address-book" />,
                path: '/vendors',
                match_path: 'vendors',
                permission: ['procurement.view'],
            },
            {
                name: 'Purchase Requests',
                icon: <i className="fa-solid fa-file-circle-plus" />,
                path: '/procurement/requests',
                match_path: 'procurement/requests',
                permission: ['procurement.view'],
            },
            {
                name: 'Purchase Orders',
                icon: <i className="fa-solid fa-file-signature" />,
                path: '/procurement/orders',
                match_path: 'procurement/orders',
                permission: ['procurement.manage'],
            },
            {
                name: 'Purchases & Sales',
                icon: <i className="fa-solid fa-receipt" />,
                path: '/procurement/transactions',
                match_path: 'procurement/transactions',
                permission: ['procurement.manage'],
            },
        ],
    },
];
