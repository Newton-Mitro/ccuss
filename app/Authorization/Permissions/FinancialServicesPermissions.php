<?php

namespace App\Authorization\Permissions;

use App\Authorization\PermissionDefinition;

final class FinancialServicesPermissions
{
    public static function definitions(): array
    {
        return [
            new PermissionDefinition('financial_services', 'View Financial Services', 'financial.view', 'view', 'Access financial products, accounts, and transactions'),
            new PermissionDefinition('financial_products', 'View Financial Products', 'financial.products.view', 'view', 'View financial products'),
            new PermissionDefinition('financial_products', 'Create Financial Products', 'financial.products.create', 'create', 'Create financial products'),
            new PermissionDefinition('financial_products', 'Update Financial Products', 'financial.products.update', 'update', 'Update financial products'),
            new PermissionDefinition('financial_products', 'Delete Financial Products', 'financial.products.delete', 'delete', 'Delete financial products'),
            new PermissionDefinition('financial_policies', 'View Product Policies', 'financial.policies.view', 'view', 'View product policies'),
            new PermissionDefinition('financial_policies', 'Manage Product Policies', 'financial.policies.manage', 'manage', 'Manage product policies'),
            new PermissionDefinition('financial_accounts', 'View Financial Accounts', 'financial.accounts.view', 'view', 'View financial accounts'),
            new PermissionDefinition('financial_accounts', 'Create Financial Accounts', 'financial.accounts.create', 'create', 'Open financial accounts'),
            new PermissionDefinition('financial_accounts', 'Update Financial Accounts', 'financial.accounts.update', 'update', 'Update financial accounts'),
            new PermissionDefinition('financial_accounts', 'Close Financial Accounts', 'financial.accounts.close', 'close', 'Close financial accounts'),
            new PermissionDefinition('financial_transactions', 'View Financial Transactions', 'financial.transactions.view', 'view', 'View financial transactions'),
            new PermissionDefinition('financial_transactions', 'Create Financial Transactions', 'financial.transactions.create', 'create', 'Create financial transactions'),
            new PermissionDefinition('financial_transactions', 'Post Financial Transactions', 'financial.transactions.post', 'post', 'Post financial transactions'),
            new PermissionDefinition('financial_transactions', 'Reverse Financial Transactions', 'financial.transactions.reverse', 'reverse', 'Reverse financial transactions'),
            new PermissionDefinition('financial_reports', 'View Financial Reports', 'financial.reports.view', 'view', 'View financial reports'),
        ];
    }
}