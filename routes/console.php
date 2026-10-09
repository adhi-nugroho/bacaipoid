<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

use Illuminate\Support\Facades\Schedule;

Schedule::command('ipo:sync')
    ->dailyAt('02:30')
    ->withoutOverlapping(55);

Schedule::command('ipo:sync-underwriter-history --limit=6')
    ->dailyAt('02:30')
    ->withoutOverlapping(180);

Schedule::command('ipo:sync-statuses')
    ->dailyAt('02:30')
    ->withoutOverlapping(10);
