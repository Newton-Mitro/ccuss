import { SidebarItem } from '../../types';

export const customerKycMenu: SidebarItem[] = [
    {
        name: 'Customer & KYC',
        icon: <i className="fa-solid fa-user-group" />,
        children_expanded: false,
        permission: ['customer.view'],
        children: [
            {
                name: 'Customers',
                icon: <i className="fa-solid fa-users" />,
                path: '/customers/list',
                match_path: 'customers/list',
                permission: ['customer.list.view'],
            },
            {
                name: 'Family & Relatives',
                icon: <i className="fa-solid fa-people-roof" />,
                path: '/customers/family-relations',
                match_path: 'customers/family-relations',
                permission: ['customer.family.view'],
            },
            {
                name: 'Introducers',
                icon: <i className="fa-solid fa-people-arrows" />,
                path: '/customers/introducers',
                match_path: 'customers/introducers',
                permission: ['customer.introducers.view'],
            },
            {
                name: 'KYC Documents',
                icon: <i className="fa-solid fa-address-card" />,
                path: '/customers/kyc-documents',
                match_path: 'customers/kyc-documents',
                permission: ['kyc-documents.view'],
            },
        ],
    },
];
