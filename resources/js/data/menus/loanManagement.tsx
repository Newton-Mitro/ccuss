import { SidebarItem } from '../../types';

export const loanManagementMenu: SidebarItem[] = [
    {
        name: 'Loan Management',
        icon: <i className="fa-solid fa-landmark" />,
        children_expanded: false,
        permission: ['loan.view'],
        children: [
            {
                name: 'Loan Product Management',
                icon: <i className="fa-solid fa-users" />,
                children_expanded: false,
                permission: ['member.view'],
                children: [
                    {
                        name: 'Member Registration',
                        icon: <i className="fa-solid fa-id-card" />,
                        path: '/member-registration',
                        match_path: 'member-registration',
                        permission: ['member.registration.create'],
                    },
                    {
                        name: 'Member List',
                        icon: <i className="fa-solid fa-id-card" />,
                        path: '/member-list',
                        match_path: 'member-list',
                        permission: ['member.list.view'],
                    },

                    {
                        name: 'Dividends',
                        icon: <i className="fa-solid fa-user-tag" />,
                        path: '/nominees',
                        match_path: 'nominees',
                        permission: ['member.nominees.view'],
                    },
                ],
            },
            {
                name: 'Loan Processing',
                icon: <i className="fa-solid fa-users" />,
                children_expanded: false,
                permission: ['member.view'],
                children: [
                    {
                        name: 'Member Registration',
                        icon: <i className="fa-solid fa-id-card" />,
                        path: '/member-registration',
                        match_path: 'member-registration',
                        permission: ['member.registration.create'],
                    },
                    {
                        name: 'Member List',
                        icon: <i className="fa-solid fa-id-card" />,
                        path: '/member-list',
                        match_path: 'member-list',
                        permission: ['member.list.view'],
                    },

                    {
                        name: 'Dividends',
                        icon: <i className="fa-solid fa-user-tag" />,
                        path: '/nominees',
                        match_path: 'nominees',
                        permission: ['member.nominees.view'],
                    },
                ],
            },
            {
                name: 'Loan Servicing',
                icon: <i className="fa-solid fa-users" />,
                children_expanded: false,
                permission: ['member.view'],
                children: [
                    {
                        name: 'Member Registration',
                        icon: <i className="fa-solid fa-id-card" />,
                        path: '/member-registration',
                        match_path: 'member-registration',
                        permission: ['member.registration.create'],
                    },
                    {
                        name: 'Member List',
                        icon: <i className="fa-solid fa-id-card" />,
                        path: '/member-list',
                        match_path: 'member-list',
                        permission: ['member.list.view'],
                    },

                    {
                        name: 'Dividends',
                        icon: <i className="fa-solid fa-user-tag" />,
                        path: '/nominees',
                        match_path: 'nominees',
                        permission: ['member.nominees.view'],
                    },
                ],
            },
        ],
    },
];
