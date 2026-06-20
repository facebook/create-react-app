<?php

use App\Modules\Lunch\Http\Controllers\LunchController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', 'verified'])->prefix('lunch')->name('lunch.')->group(function () {
    Route::get('dashboard', [LunchController::class, 'dashboard'])->name('dashboard');
    Route::get('suppliers', [LunchController::class, 'suppliers'])->name('suppliers');
    Route::post('suppliers', [LunchController::class, 'storeSupplier'])->name('suppliers.store');
    Route::get('products', [LunchController::class, 'products'])->name('products');
    Route::post('products', [LunchController::class, 'storeProduct'])->name('products.store');
    Route::get('orders', [LunchController::class, 'orders'])->name('orders');
    Route::post('orders', [LunchController::class, 'placeOrder'])->name('orders.store');
    Route::patch('orders/{order}/status', [LunchController::class, 'updateStatus'])->name('orders.status');
});
