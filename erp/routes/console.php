<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('invoices:generate-recurring')->dailyAt('02:00');
Schedule::command('reports:send-scheduled')->hourly();
Schedule::command('alerts:evaluate')->everyFifteenMinutes();
