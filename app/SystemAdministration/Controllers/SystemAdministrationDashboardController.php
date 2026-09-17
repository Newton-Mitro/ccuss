<?php

namespace App\SystemAdministration\Controllers;

use App\SystemAdministration\Models\AuditLog;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\DatabaseBackupLog;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SystemAdministrationDashboardController
{
    public function index(Request $request): Response
    {
        $organizationId = $request->attributes->get('active_organization')->id;

        return Inertia::render('system-administration/dashboard', [
            'stats' => [
                'organizations' => Organization::count(),
                'branches' => Branch::where('organization_id', $organizationId)->count(),
                'users' => User::where('organization_id', $organizationId)->count(),
                'roles' => Role::count(),
                'auditLogs' => AuditLog::where('organization_id', $organizationId)->count(),
                'successfulBackups' => DatabaseBackupLog::where('status', DatabaseBackupLog::STATUS_SUCCESS)->count(),
            ],
        ]);
    }
}
