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
                path: '/customers',
                match_path: 'customers',
                permission: ['customer.list.view'],
            },
            {
                name: 'Family & Relative Approvals',
                icon: <i className="fa-solid fa-people-roof" />,
                path: '/family-relations',
                match_path: 'family-relations',
                permission: ['customer.family.view'],
            },
            {
                name: 'Introducer Approvals',
                icon: <i className="fa-solid fa-people-arrows" />,
                path: '/introducers',
                match_path: 'introducers',
                permission: ['customer.introducers.view'],
            },
            {
                name: 'KYC Document Approvals',
                icon: <i className="fa-solid fa-address-card" />,
                path: '/kyc-documents',
                match_path: 'kyc-documents',
                permission: ['kyc-documents.view'],
            },
        ],
    },
];
