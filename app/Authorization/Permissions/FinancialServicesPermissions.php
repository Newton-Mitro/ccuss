<?php

namespace App\Authorization\Permissions;

use App\Authorization\PermissionDefinition;

final class FinancialServicesPermissions
{
    public static function definitions(): array
    {
        return [
            new PermissionDefinition('Financial Services', 'View Financial Services', 'financial.view', 'view', 'Access financial products, accounts, and transactions'),
            new PermissionDefinition('Financial Services', 'View Financial Dashboard', 'financial.dashboard.view', 'view', 'View the financial services dashboard'),
            new PermissionDefinition('Financial Products', 'View Financial Products', 'financial.products.view', 'view', 'View financial products'),
            new PermissionDefinition('Financial Products', 'Create Financial Products', 'financial.products.create', 'create', 'Create financial products'),
            new PermissionDefinition('Financial Products', 'Update Financial Products', 'financial.products.update', 'update', 'Update financial products'),
            new PermissionDefinition('Financial Products', 'Delete Financial Products', 'financial.products.delete', 'delete', 'Delete financial products'),
            new PermissionDefinition('Financial Products', 'Manage Product Account Mappings', 'financial.products.mappings.manage', 'manage', 'Manage product-to-ledger account mappings'),
            new PermissionDefinition('Financial Policies', 'View Product Policies', 'financial.policies.view', 'view', 'View product policies'),
            new PermissionDefinition('Financial Policies', 'Manage Product Policies', 'financial.policies.manage', 'manage', 'Manage product policies'),
            new PermissionDefinition('Financial Accounts', 'View Financial Accounts', 'financial.accounts.view', 'view', 'View financial accounts'),
            new PermissionDefinition('Financial Accounts', 'Create Financial Accounts', 'financial.accounts.create', 'create', 'Open financial accounts'),
            new PermissionDefinition('Financial Accounts', 'Update Financial Accounts', 'financial.accounts.update', 'update', 'Update financial accounts'),
            new PermissionDefinition('Financial Accounts', 'Close Financial Accounts', 'financial.accounts.close', 'close', 'Close financial accounts'),
            new PermissionDefinition('Financial Transactions', 'View Financial Transactions', 'financial.transactions.view', 'view', 'View financial transactions'),
            new PermissionDefinition('Financial Transactions', 'Create Financial Transactions', 'financial.transactions.create', 'create', 'Create financial transactions'),
            new PermissionDefinition('Financial Transactions', 'Post Financial Transactions', 'financial.transactions.post', 'post', 'Post financial transactions'),
            new PermissionDefinition('Financial Transactions', 'Reverse Financial Transactions', 'financial.transactions.reverse', 'reverse', 'Reverse financial transactions'),
            new PermissionDefinition('Financial Reports', 'View Financial Reports', 'financial.reports.view', 'view', 'View financial reports'),
        ];
    }
}