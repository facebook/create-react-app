<?php

use App\Modules\Subcontracting\Http\Controllers\SubcontractController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', 'verified'])->prefix('subcontracting')->name('subcontracting.')->group(function () {
    // Custom action routes BEFORE resource
    Route::post('orders/{order}/send', [SubcontractController::class, 'send'])->name('orders.send');
    Route::post('orders/{order}/start-production', [SubcontractController::class, 'startProduction'])->name('orders.start-production');
    Route::post('orders/{order}/receive', [SubcontractController::class, 'receive'])->name('orders.receive');
    Route::post('orders/{order}/cancel', [SubcontractController::class, 'cancel'])->name('orders.cancel');
    Route::post('orders/{order}/components', [SubcontractController::class, 'addComponent'])->name('orders.components.store');
    Route::delete('orders/{order}/components/{component}', [SubcontractController::class, 'removeComponent'])->name('orders.components.destroy');
    Route::resource('orders', SubcontractController::class)->except(['create', 'edit']);
});
