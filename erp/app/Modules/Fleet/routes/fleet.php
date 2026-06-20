<?php

use App\Modules\Fleet\Http\Controllers\FleetDashboardController;
use App\Modules\Fleet\Http\Controllers\FuelLogController;
use App\Modules\Fleet\Http\Controllers\VehicleController;
use App\Modules\Fleet\Http\Controllers\VehicleMaintenanceController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', 'verified'])->prefix('fleet')->name('fleet.')->group(function () {
    Route::get('dashboard', [FleetDashboardController::class, 'index'])->name('dashboard');

    Route::resource('vehicles', VehicleController::class);

    Route::delete('fuel-logs/{fuel_log}', [FuelLogController::class, 'destroy'])->name('fuel-logs.destroy');
    Route::resource('fuel-logs', FuelLogController::class)->only(['index', 'store']);

    Route::post('maintenances/{maintenance}/complete', [VehicleMaintenanceController::class, 'complete'])->name('maintenances.complete');
    Route::delete('maintenances/{maintenance}', [VehicleMaintenanceController::class, 'destroy'])->name('maintenances.destroy');
    Route::resource('maintenances', VehicleMaintenanceController::class)->only(['index', 'store']);
});
