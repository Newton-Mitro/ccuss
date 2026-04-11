<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string $roles): Response
    {
        $user = $request->user();

        if (!$user) {
            abort(403, 'Unauthorized - No user logged in');
        }

        $roleList = explode(',', $roles);

        if (!$user->hasAnyRole($roleList)) {
            abort(403, 'You do not have the required role.');
        }

        return $next($request);
    }
}
