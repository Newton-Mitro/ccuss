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
                name: 'Family & Relatives',
                icon: <i className="fa-solid fa-people-roof" />,
                path: '/family-relations',
                match_path: 'family-relations',
                permission: ['customer.family.view'],
            },
            {
                name: 'Introducers',
                icon: <i className="fa-solid fa-people-arrows" />,
                path: '/introducers',
                match_path: 'introducers',
                permission: ['customer.introducers.view'],
            },
            {
                name: 'KYC Profiles',
                icon: <i className="fa-solid fa-address-card" />,
                path: '/customer/kyc-profiles',
                match_path: 'kyc-profiles',
                permission: ['customer.kyc-profiles.view'],
            },
        ],
    },
];
