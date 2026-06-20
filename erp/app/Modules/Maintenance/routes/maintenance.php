<?php

use App\Modules\Maintenance\Http\Controllers\MaintenanceController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', 'verified'])->prefix('maintenance')->name('maintenance.')->group(function () {
    Route::get('dashboard', [MaintenanceController::class, 'dashboard'])->name('dashboard');

    // Equipment
    Route::get('equipment', [MaintenanceController::class, 'equipment'])->name('equipment');
    Route::post('equipment', [MaintenanceController::class, 'storeEquipment'])->name('equipment.store');

    // Maintenance Plans
    Route::get('plans', [MaintenanceController::class, 'plans'])->name('plans');
    Route::post('plans', [MaintenanceController::class, 'storePlan'])->name('plans.store');

    // Maintenance Orders
    Route::get('orders', [MaintenanceController::class, 'orders'])->name('orders');
    Route::post('orders', [MaintenanceController::class, 'storeOrder'])->name('orders.store');
    Route::post('orders/{order}/start', [MaintenanceController::class, 'startOrder'])->name('orders.start');
    Route::post('orders/{order}/complete', [MaintenanceController::class, 'completeOrder'])->name('orders.complete');
});
