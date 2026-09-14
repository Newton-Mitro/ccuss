<?php

namespace App\Authorization;

use App\Authorization\Permissions\CustomerPermissions;
use App\Authorization\Permissions\LoanPermissions;
use App\Authorization\Permissions\SystemAdministrationPermissions;

final class PermissionRegistry
{
    public static function definitions(): array
    {
        return array_merge(
            CustomerPermissions::definitions(),
            LoanPermissions::definitions(),
            SystemAdministrationPermissions::definitions(),
        );
    }
}