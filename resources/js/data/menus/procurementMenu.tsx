import { SidebarItem } from '../../types';

export const procurementMenu: SidebarItem[] = [
    {
        name: 'Procurement',
        icon: <i className="fa-solid fa-cart-shopping" />,
        children_expanded: false,
        permission: ['procurement.view'],
        children: [
            {
                name: 'Purchase Requests',
                icon: <i className="fa-solid fa-file-circle-plus" />,
                path: '/purchase-requests',
                match_path: 'purchase-requests',
                permission: ['purchase.request.view'],
            },
            {
                name: 'Purchase Orders',
                icon: <i className="fa-solid fa-file-invoice" />,
                path: '/purchase-orders',
                match_path: 'purchase-orders',
                permission: ['purchase.order.view'],
            },
            {
                name: 'Suppliers / Vendors',
                icon: <i className="fa-solid fa-truck" />,
                path: '/suppliers',
                match_path: 'suppliers',
                permission: ['supplier.view'],
            },
            {
                name: 'Procurement Approvals',
                icon: <i className="fa-solid fa-check-circle" />,
                path: '/procurement-approvals',
                match_path: 'procurement-approvals',
                permission: ['procurement.approval.view'],
            },
        ],
    },
];
