<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\PermissionMiddleware;
use App\Http\Middleware\RoleMiddleware;
use App\SystemAdministration\Middleware\AuditBatchMiddleware;
use Illuminate\Auth\Middleware\EnsureEmailIsVerified;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // 🍪 Encrypt cookies except specific ones
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        // 🌐 Web middleware stack
        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            AuditBatchMiddleware::class,
        ]);

        // 🧩 Register custom route middleware aliases
        $middleware->alias([
            'permission' => PermissionMiddleware::class,
            'role' => RoleMiddleware::class,
            'verified' => EnsureEmailIsVerified::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\HttpException $e) {

            $status = 500;

            // Get HTTP exception status (403, 404, 500, etc.)
            if ($e instanceof HttpExceptionInterface) {
                $status = $e->getStatusCode();
            }

            if ($status === 403) {
                return Inertia::render('errors/403')
                    ->toResponse(request())
                    ->setStatusCode(403);
            }

            if ($status === 500) {
                return Inertia::render('errors/500')
                    ->toResponse(request())
                    ->setStatusCode(500);
            }
        });
        $exceptions->report(function (\Throwable $e) {
            return Inertia::render('errors/500')
                ->toResponse(request())
                ->setStatusCode(500);
        });
    })
    ->create();
