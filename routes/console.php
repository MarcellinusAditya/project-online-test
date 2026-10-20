<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('settings:send-summaries daily')->dailyAt('07:00');
Schedule::command('settings:send-summaries weekly')->weeklyOn(1, '07:00');
