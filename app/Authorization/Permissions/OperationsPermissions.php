<?php

namespace App\Authorization\Permissions;

use App\Authorization\PermissionDefinition;

final class OperationsPermissions
{
    public static function definitions(): array
    {
        return [
            new PermissionDefinition('Operations', 'View Operations', 'operations.view', 'view', 'Access investments, procurement, fixed assets, and people operations'),
            new PermissionDefinition('Investments', 'View Investments', 'investments.view', 'view', 'View long-term investments and term deposits'),
            new PermissionDefinition('Investments', 'Manage Investments', 'investments.manage', 'manage', 'Purchase, sell, mature, and reconcile investments'),
            new PermissionDefinition('Procurement', 'View Procurement', 'procurement.view', 'view', 'View vendors and procurement activity'),
            new PermissionDefinition('Procurement', 'Manage Procurement', 'procurement.manage', 'manage', 'Create and manage vendor purchases and sales'),
            new PermissionDefinition('Fixed Assets', 'View Fixed Assets', 'fixed_assets.view', 'view', 'View the fixed asset register'),
            new PermissionDefinition('Fixed Assets', 'Manage Fixed Assets', 'fixed_assets.manage', 'manage', 'Purchase, depreciate, transfer, and dispose of fixed assets'),
            new PermissionDefinition('Human Resources', 'View Employees', 'hr.view', 'view', 'View employee records'),
            new PermissionDefinition('Human Resources', 'View Attendance', 'hr.attendance.view', 'view', 'View employee attendance'),
            new PermissionDefinition('Human Resources', 'View Leave', 'hr.leave.view', 'view', 'View and manage employee leave'),
            new PermissionDefinition('Human Resources', 'View HR Reports', 'hr.reports.view', 'view', 'View human resources reports'),
            new PermissionDefinition('Payroll', 'View Payroll', 'payroll.view', 'view', 'View payroll processing and history'),
        ];
    }
}
