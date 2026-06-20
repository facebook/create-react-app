<?php

use App\Modules\Repairs\Http\Controllers\RepairController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', 'verified'])->prefix('repairs')->name('repairs.')->group(function () {
    Route::get('dashboard', [RepairController::class, 'dashboard'])->name('dashboard');

    Route::get('orders', [RepairController::class, 'index'])->name('orders.index');
    Route::post('orders', [RepairController::class, 'store'])->name('orders.store');
    Route::get('orders/{order}', [RepairController::class, 'show'])->name('orders.show');
    Route::patch('orders/{order}', [RepairController::class, 'update'])->name('orders.update');
    Route::post('orders/{order}/confirm', [RepairController::class, 'confirm'])->name('orders.confirm');
    Route::post('orders/{order}/start', [RepairController::class, 'start'])->name('orders.start');
    Route::post('orders/{order}/complete', [RepairController::class, 'complete'])->name('orders.complete');
    Route::post('orders/{order}/cancel', [RepairController::class, 'cancel'])->name('orders.cancel');
    Route::post('orders/{order}/lines', [RepairController::class, 'addLine'])->name('orders.lines.store');

    Route::delete('lines/{line}', [RepairController::class, 'removeLine'])->name('lines.destroy');
});
