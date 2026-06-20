<?php

use App\Modules\FieldService\Http\Controllers\FieldServiceDashboardController;
use App\Modules\FieldService\Http\Controllers\ServiceChecklistController;
use App\Modules\FieldService\Http\Controllers\ServiceOrderController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', 'verified'])->prefix('field-service')->name('field-service.')->group(function () {
    Route::get('dashboard', [FieldServiceDashboardController::class, 'index'])->name('dashboard');

    // Order actions BEFORE resource
    Route::post('orders/{order}/start',            [ServiceOrderController::class, 'start'])->name('orders.start');
    Route::post('orders/{order}/complete',         [ServiceOrderController::class, 'complete'])->name('orders.complete');
    Route::post('orders/{order}/cancel',           [ServiceOrderController::class, 'cancel'])->name('orders.cancel');
    Route::post('orders/{order}/update-checklist', [ServiceOrderController::class, 'updateChecklist'])->name('orders.update-checklist');
    Route::resource('orders', ServiceOrderController::class);

    Route::resource('checklists', ServiceChecklistController::class)->except(['show', 'create', 'edit']);
});
