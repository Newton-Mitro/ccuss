<?php

use Illuminate\Support\Facades\Schedule;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// UTC Time
Schedule::command('backup:run')
    ->dailyAt('11:19')
    ->name('database-full-backup')
    ->withoutOverlapping();

Schedule::command('backup:cleanup')
    ->dailyAt('03:00')
    ->name('cleanup-backups')
    ->withoutOverlapping();