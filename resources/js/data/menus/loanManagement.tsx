import { SidebarItem } from '../../types';

export const loanManagementMenu: SidebarItem[] = [
    {
        name: 'Loan Management',
        icon: <i className="fa-solid fa-hand-holding-dollar" />,
        children_expanded: false,
        permission: ['loan.view'],
        children: [
            {
                name: 'Loan Product Config',
                icon: <i className="fa-solid fa-cogs" />,
                children_expanded: false,
                permission: ['loan.product.view'],
                children: [
                    {
                        name: 'Loan Products',
                        icon: <i className="fa-solid fa-money-bill-wave" />,
                        path: '/loan-products',
                        match_path: 'loan-products',
                        permission: ['loan.product.create'],
                    },
                ],
            },
            {
                name: 'Loan Processing',
                icon: <i className="fa-solid fa-file-invoice-dollar" />,
                children_expanded: false,
                permission: ['loan.application.view'],
                children: [
                    {
                        name: 'Loan Applications',
                        icon: <i className="fa-solid fa-file-circle-plus" />,
                        path: '/loan-applications',
                        match_path: 'loan-applications',
                        permission: ['loan.application.create'],
                    },
                    {
                        name: 'Loan Approvals',
                        icon: <i className="fa-solid fa-check-double" />,
                        path: '/loan-approvals',
                        match_path: 'loan-approvals',
                        permission: ['loan.approval.view'],
                    },
                    {
                        name: 'Loan Disbursements',
                        icon: <i className="fa-solid fa-money-check-dollar" />,
                        path: '/loan-disbursements',
                        match_path: 'loan-disbursements',
                        permission: ['loan.disbursement.view'],
                    },
                ],
            },
            {
                name: 'Loan Servicing',
                icon: <i className="fa-solid fa-user-clock" />,
                children_expanded: false,
                permission: ['loan.account.view'],
                children: [
                    {
                        name: 'Loan Accounts',
                        icon: <i className="fa-solid fa-wallet" />,
                        path: '/loan-accounts',
                        match_path: 'loan-accounts',
                        permission: ['loan.account.view'],
                    },
                    {
                        name: 'Repayment Schedules',
                        icon: <i className="fa-solid fa-calendar-days" />,
                        path: '/repayment-schedules',
                        match_path: 'repayment-schedules',
                        permission: ['loan.schedule.view'],
                    },
                    {
                        name: 'Collateral / Security',
                        icon: <i className="fa-solid fa-shield-halved" />,
                        path: '/loan-collateral',
                        match_path: 'loan-collateral',
                        permission: ['loan.collateral.view'],
                    },
                    {
                        name: 'Charges / Fees',
                        icon: <i className="fa-solid fa-coins" />,
                        path: '/loan-charges',
                        match_path: 'loan-charges',
                        permission: ['loan.charges.view'],
                    },
                    {
                        name: 'Recoveries / Collections',
                        icon: <i className="fa-solid fa-hand-holding-hand" />,
                        path: '/loan-recoveries',
                        match_path: 'loan-recoveries',
                        permission: ['loan.recovery.view'],
                    },
                ],
            },
            {
                name: 'Loan Reports',
                icon: <i className="fa-solid fa-chart-pie" />,
                children_expanded: false,
                permission: ['loan.report.view'],
                children: [
                    {
                        name: 'Portfolio Summary',
                        icon: <i className="fa-solid fa-book-open" />,
                        path: '/loan-portfolio-summary',
                        match_path: 'loan-portfolio-summary',
                        permission: ['loan.report.view'],
                    },
                    {
                        name: 'Delinquency Reports',
                        icon: (
                            <i className="fa-solid fa-triangle-exclamation" />
                        ),
                        path: '/loan-delinquency',
                        match_path: 'loan-delinquency',
                        permission: ['loan.report.view'],
                    },
                ],
            },
        ],
    },
];
