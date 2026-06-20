<?php

use App\Modules\Frontdesk\Http\Controllers\FrontdeskController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', 'verified'])->prefix('frontdesk')->name('frontdesk.')->group(function () {
    Route::get('dashboard', [FrontdeskController::class, 'dashboard'])->name('dashboard');
    Route::get('stations', [FrontdeskController::class, 'stations'])->name('stations');
    Route::post('stations', [FrontdeskController::class, 'storeStation'])->name('stations.store');
    Route::get('visitors', [FrontdeskController::class, 'visitors'])->name('visitors');
    Route::get('check-in', [FrontdeskController::class, 'checkIn'])->name('check-in');
    Route::post('check-in', [FrontdeskController::class, 'checkIn'])->name('check-in.store');
    Route::post('visitors/{visitor}/check-out', [FrontdeskController::class, 'doCheckOut'])->name('visitors.check-out');
    Route::post('visitors/{visitor}/no-show', [FrontdeskController::class, 'markNoShow'])->name('visitors.no-show');
    Route::post('pre-register', [FrontdeskController::class, 'preRegister'])->name('pre-register');
});
