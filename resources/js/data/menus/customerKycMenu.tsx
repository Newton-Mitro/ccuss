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
                permission: ['customer.view'],
            },
            {
                name: 'Addresses Approval',
                icon: <i className="fa-solid fa-location-dot" />,
                path: '/addresses-approval',
                match_path: 'addresses-approval',
                permission: ['customer_address.view'],
            },
            {
                name: 'Family & Relatives Approval',
                icon: <i className="fa-solid fa-people-roof" />,
                path: '/family-relations-approval',
                match_path: 'family-relations-approval',
                permission: ['customer_family_relation.view'],
            },
            {
                name: 'Introducers Approval',
                icon: <i className="fa-solid fa-people-arrows" />,
                path: '/introducers-approval',
                match_path: 'introducers-approval',
                permission: ['customer_introducer.view'],
            },
            {
                name: 'KYC Documents Approval',
                icon: <i className="fa-solid fa-address-card" />,
                path: '/kyc-documents-approval',
                match_path: 'kyc-documents-approval',
                permission: ['customer_kyc_document.view'],
            },
        ],
    },
];
