import { SidebarItem } from '../../types';

export const loanManagementMenu: SidebarItem[] = [
    {
        name: 'Loan Management',
        icon: <i className="fa-solid fa-hand-holding-dollar" />,
        children_expanded: false,
        permission: ['loan.view'],
        children: [
            // ===============================
            // Loan Product Config
            // ===============================
            {
                name: 'Loan Product Config',
                icon: <i className="fa-solid fa-cogs" />, // configuration
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
                    {
                        name: 'Product Interest Rules',
                        icon: <i className="fa-solid fa-percent" />,
                        path: '/loan-interest-rules',
                        match_path: 'loan-interest-rules',
                        permission: ['loan.interest.view'],
                    },
                    {
                        name: 'Product Fees',
                        icon: <i className="fa-solid fa-coins" />,
                        path: '/loan-fees',
                        match_path: 'loan-fees',
                        permission: ['loan.fees.view'],
                    },
                    {
                        name: 'Product Charges',
                        icon: <i className="fa-solid fa-file-invoice-dollar" />,
                        path: '/loan-charges',
                        match_path: 'loan-charges',
                        permission: ['loan.charges.view'],
                    },
                    {
                        name: 'Product Eligibility',
                        icon: <i className="fa-solid fa-user-check" />,
                        path: '/loan-eligibility',
                        match_path: 'loan-eligibility',
                        permission: ['loan.eligibility.view'],
                    },
                    {
                        name: 'Prepayment / Early Closure Rules',
                        icon: (
                            <i className="fa-solid fa-arrow-right-from-bracket" />
                        ),
                        path: '/loan-prepayment-rules',
                        match_path: 'loan-prepayment-rules',
                        permission: ['loan.prepayment.view'],
                    },
                    {
                        name: 'Penalties / Fine Rules',
                        icon: <i className="fa-solid fa-gavel" />,
                        path: '/loan-fine-rules',
                        match_path: 'loan-fine-rules',
                        permission: ['loan.fine.view'],
                    },
                ],
            },

            // ===============================
            // Loan Processing
            // ===============================
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

            // ===============================
            // Loan Servicing
            // ===============================
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
                    {
                        name: 'Interest / Fine Posting',
                        icon: <i className="fa-solid fa-file-invoice" />,
                        path: '/loan-interest-fine',
                        match_path: 'loan-interest-fine',
                        permission: ['loan.interest-fine.view'],
                    },
                    {
                        name: 'Prepayments / Early Repayments',
                        icon: (
                            <i className="fa-solid fa-arrow-right-from-bracket" />
                        ),
                        path: '/loan-prepayments',
                        match_path: 'loan-prepayments',
                        permission: ['loan.prepayment.view'],
                    },
                    {
                        name: 'Loan Write-Offs',
                        icon: <i className="fa-solid fa-trash-can" />,
                        path: '/loan-write-offs',
                        match_path: 'loan-write-offs',
                        permission: ['loan.writeoff.view'],
                    },
                    {
                        name: 'Loan Statements',
                        icon: <i className="fa-solid fa-file-invoice" />,
                        path: '/loan-statements',
                        match_path: 'loan-statements',
                        permission: ['loan.statement.view'],
                    },
                ],
            },

            // ===============================
            // Loan Reports
            // ===============================
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
                    {
                        name: 'Recovery / Collection Reports',
                        icon: <i className="fa-solid fa-hand-holding-hand" />,
                        path: '/loan-recovery-reports',
                        match_path: 'loan-recovery-reports',
                        permission: ['loan.report.view'],
                    },
                ],
            },
        ],
    },
];
