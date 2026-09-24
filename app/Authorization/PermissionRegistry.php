<?php

namespace App\Authorization;

use App\Authorization\Permissions\CustomerPermissions;
use App\Authorization\Permissions\FinancialServicesPermissions;
use App\Authorization\Permissions\GeneralAccountingPermissions;
use App\Authorization\Permissions\OperationsPermissions;
use App\Authorization\Permissions\SystemAdministrationPermissions;
use App\Authorization\Permissions\TreasuryPermissions;

final class PermissionRegistry
{
    public static function definitions(): array
    {
        return array_merge(
            CustomerPermissions::definitions(),
            FinancialServicesPermissions::definitions(),
            GeneralAccountingPermissions::definitions(),
            OperationsPermissions::definitions(),
            TreasuryPermissions::definitions(),
            SystemAdministrationPermissions::definitions(),
        );
    }
}