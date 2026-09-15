<?php

namespace App\SystemAdministration\Middleware;

use App\SystemAdministration\Models\Organization;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureActiveOrganization
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()) {
            return $next($request);
        }

        $activeOrganizationId = $request->session()->get('active_organization_id');

        if (!$activeOrganizationId || !Organization::query()->whereKey($activeOrganizationId)->exists()) {
            return redirect()->route('organizations.index');
        }

        return $next($request);
    }
}