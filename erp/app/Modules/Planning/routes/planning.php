<?php

use App\Modules\Planning\Http\Controllers\PlanningController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', 'verified'])->prefix('planning')->name('planning.')->group(function () {
    Route::get('schedule', [PlanningController::class, 'schedule'])->name('schedule');
    Route::post('{shift}/confirm', [PlanningController::class, 'confirm'])->name('shifts.confirm');
    Route::post('{shift}/complete', [PlanningController::class, 'complete'])->name('shifts.complete');
    Route::post('{shift}/cancel', [PlanningController::class, 'cancel'])->name('shifts.cancel');
    Route::post('{shift}/swap', [PlanningController::class, 'requestSwap'])->name('shifts.swap');
    Route::post('{shift}/swaps/{swap}/approve', [PlanningController::class, 'approveSwap'])->name('shifts.swaps.approve');
    Route::post('{shift}/swaps/{swap}/reject', [PlanningController::class, 'rejectSwap'])->name('shifts.swaps.reject');
    Route::get('', [PlanningController::class, 'index'])->name('index');
    Route::post('', [PlanningController::class, 'store'])->name('store');
    Route::get('{shift}', [PlanningController::class, 'show'])->name('show');
    Route::patch('{shift}', [PlanningController::class, 'update'])->name('update');
    Route::delete('{shift}', [PlanningController::class, 'destroy'])->name('destroy');
});
