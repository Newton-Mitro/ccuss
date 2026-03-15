import { SidebarItem } from '../../types';

export const payrollMenu: SidebarItem[] = [
    {
        name: 'Payroll Management',
        icon: <i className="fa-solid fa-money-check-dollar" />,
        children_expanded: false,
        permission: ['payroll.view'],
        children: [
            {
                name: 'Employees',
                icon: <i className="fa-solid fa-user-tie" />,
                path: '/employees',
                match_path: 'employees',
                permission: ['payroll.employees.view'],
            },
            {
                name: 'Payroll Processing',
                icon: <i className="fa-solid fa-gears" />,
                path: '/payroll-processing',
                match_path: 'payroll-processing',
                permission: ['payroll.processing.create'],
            },
            {
                name: 'Salary Payments',
                icon: <i className="fa-solid fa-money-bill-wave" />,
                path: '/salary-payments',
                match_path: 'salary-payments',
                permission: ['payroll.salary.create'],
            },
        ],
    },
];
