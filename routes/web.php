<?php

use App\Http\Controllers\IpoController;
use Illuminate\Support\Facades\Route;

Route::get('/', [IpoController::class, 'index'])->name('home')->middleware('throttle:web');

Route::get('/ipo/{code}', [IpoController::class, 'show'])
    ->name('ipo.show')
    ->where('code', '[A-Za-z0-9.-]+')
    ->middleware('throttle:web');

Route::get('/sitemap.xml', [IpoController::class, 'sitemap'])->name('sitemap');
Route::get('/robots.txt', [IpoController::class, 'robots'])->name('robots');

require __DIR__.'/auth.php';
