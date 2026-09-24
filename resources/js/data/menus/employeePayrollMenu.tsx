import { SidebarItem } from '../../types';

export const employeePayrollMenu: SidebarItem[] = [
    {
        name: 'Employee & Payroll',
        icon: <i className="fa-solid fa-users-gear" />,
        permission: ['hr.view'],
        children_expanded: false,
        children: [
            {
                name: 'Employees',
                icon: <i className="fa-solid fa-users" />,
                path: '/employees',
                match_path: 'employees',
                permission: ['hr.view'],
            },
            {
                name: 'Attendance',
                icon: <i className="fa-solid fa-calendar-check" />,
                path: '/attendance',
                match_path: 'attendance',
                permission: ['hr.attendance.view'],
            },
            {
                name: 'Leave Management',
                icon: <i className="fa-solid fa-person-walking-arrow-right" />,
                path: '/leave',
                match_path: 'leave',
                permission: ['hr.leave.view'],
            },
            {
                name: 'Payroll',
                icon: <i className="fa-solid fa-money-check-dollar" />,
                path: '/payroll',
                match_path: 'payroll',
                permission: ['payroll.view'],
            },
            {
                name: 'HR Reports',
                icon: <i className="fa-solid fa-chart-pie" />,
                path: '/hr/reports',
                match_path: 'hr/reports',
                permission: ['hr.reports.view'],
            },
        ],
    },
];
