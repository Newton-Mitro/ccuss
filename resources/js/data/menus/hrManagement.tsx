import { SidebarItem } from '../../types';

export const hrManagementMenu: SidebarItem[] = [
    {
        name: 'HR & Payroll',
        icon: <i className="fa-solid fa-user-tie" />,
        children_expanded: false,
        permission: ['hr.view'],
        children: [
            {
                name: 'Employee Management',
                icon: <i className="fa-solid fa-users" />,
                children_expanded: false,
                permission: ['employee.view'],
                children: [
                    {
                        name: 'Employee List',
                        icon: <i className="fa-solid fa-id-card" />,
                        path: '/employees',
                        match_path: 'employees',
                        permission: ['employee.view'],
                    },
                    {
                        name: 'Employee Profiles',
                        icon: <i className="fa-solid fa-address-card" />,
                        path: '/employee-profiles',
                        match_path: 'employee-profiles',
                        permission: ['employee.profile.view'],
                    },
                    {
                        name: 'Departments',
                        icon: <i className="fa-solid fa-building" />,
                        path: '/departments',
                        match_path: 'departments',
                        permission: ['department.view'],
                    },
                    {
                        name: 'Designations',
                        icon: <i className="fa-solid fa-briefcase" />,
                        path: '/designations',
                        match_path: 'designations',
                        permission: ['designation.view'],
                    },
                ],
            },
            {
                name: 'Attendance Management',
                icon: <i className="fa-solid fa-clock" />,
                children_expanded: false,
                permission: ['attendance.view'],
                children: [
                    {
                        name: 'Attendance Logs',
                        icon: <i className="fa-solid fa-calendar-check" />,
                        path: '/attendance-logs',
                        match_path: 'attendance-logs',
                        permission: ['attendance.view'],
                    },
                    {
                        name: 'Shift Schedules',
                        icon: <i className="fa-solid fa-calendar-alt" />,
                        path: '/shift-schedules',
                        match_path: 'shift-schedules',
                        permission: ['shift.view'],
                    },
                ],
            },
            {
                name: 'Leave Management',
                icon: <i className="fa-solid fa-plane-departure" />,
                children_expanded: false,
                permission: ['leave.view'],
                children: [
                    {
                        name: 'Leave Requests',
                        icon: <i className="fa-solid fa-envelope-open-text" />,
                        path: '/leave-requests',
                        match_path: 'leave-requests',
                        permission: ['leave.request.view'],
                    },
                    {
                        name: 'Leave Types',
                        icon: <i className="fa-solid fa-tags" />,
                        path: '/leave-types',
                        match_path: 'leave-types',
                        permission: ['leave.type.view'],
                    },
                    {
                        name: 'Leave Approvals',
                        icon: <i className="fa-solid fa-check-circle" />,
                        path: '/leave-approvals',
                        match_path: 'leave-approvals',
                        permission: ['leave.approval.view'],
                    },
                ],
            },
            {
                name: 'Payroll Management',
                icon: <i className="fa-solid fa-money-bill-wave" />,
                children_expanded: false,
                permission: ['payroll.view'],
                children: [
                    {
                        name: 'Salary Structures',
                        icon: <i className="fa-solid fa-file-invoice-dollar" />,
                        path: '/salary-structures',
                        match_path: 'salary-structures',
                        permission: ['salary.structure.view'],
                    },
                    {
                        name: 'Salary Processing',
                        icon: <i className="fa-solid fa-calculator" />,
                        path: '/salary-processing',
                        match_path: 'salary-processing',
                        permission: ['salary.processing.view'],
                    },
                    {
                        name: 'Payroll Reports',
                        icon: <i className="fa-solid fa-chart-line" />,
                        path: '/payroll-reports',
                        match_path: 'payroll-reports',
                        permission: ['payroll.report.view'],
                    },
                ],
            },
        ],
    },
];
