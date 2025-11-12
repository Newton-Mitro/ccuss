<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PermissionMiddleware
{
    public function handle(Request $request, Closure $next, string $permissions): Response
    {
        $user = $request->user();

        if (!$user) {
            abort(403, 'Unauthorized - No user logged in');
        }

        $permissionList = explode(',', $permissions);

        if (!$user->hasAnyPermission($permissionList)) {
            abort(403, 'You do not have the required permission.');
        }

        return $next($request);
    }
}