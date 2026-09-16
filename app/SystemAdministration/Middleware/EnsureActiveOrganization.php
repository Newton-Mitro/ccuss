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

        $hasAccess = $activeOrganizationId && (
            $request->user()->organizations()->whereKey($activeOrganizationId)->exists()
            || $request->user()->organization_id === (int) $activeOrganizationId
        );

        if (!$hasAccess) {
            $request->session()->forget('active_organization_id');
            return redirect()->route('organizations.index');
        }

        $request->attributes->set(
            'active_organization',
            Organization::query()->findOrFail($activeOrganizationId),
        );

        return $next($request);
    }
}