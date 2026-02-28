<?php

namespace App\Audit\Middleware;

use Closure;
use Illuminate\Support\Str;

class AuditBatchMiddleware
{
    public function handle($request, Closure $next)
    {
        app()->instance('audit.batch_id', (string) Str::uuid());

        return $next($request);
    }
}