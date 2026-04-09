<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Inertia::share([
            'flash' => fn() => [
                'success' => session('success'),
                'error' => session('error'),
                'message' => session('message'),

            ],
            'appName' => config('app.name'),
            'appNameFirst' => config('app.name_first'),
            'appNameSecond' => config('app.name_second'),
            'appVersion' => config('app.app_version'),
            'appShortTag' => config('app.app_short_tag'),
            'appLongTag' => config('app.app_long_tag'),
        ]);
    }
}
