<?php

use App\Modules\POS\Http\Controllers\PosDashboardController;
use App\Modules\POS\Http\Controllers\PosOrderController;
use App\Modules\POS\Http\Controllers\PosSessionController;
use App\Modules\POS\Http\Controllers\PosTerminalController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', 'verified'])->prefix('pos')->name('pos.')->group(function () {
    Route::get('dashboard', [PosDashboardController::class, 'index'])->name('dashboard');

    // Terminal
    Route::get('terminal',                           [PosTerminalController::class, 'terminal'])->name('terminal');
    Route::get('terminal/products',                  [PosTerminalController::class, 'products'])->name('terminal.products');
    Route::post('terminal/checkout',                 [PosTerminalController::class, 'checkout'])->name('terminal.checkout');
    Route::get('terminal/{session}/receipt/{order}', [PosTerminalController::class, 'receipt'])->name('terminal.receipt');
    Route::get('sessions-list',                      [PosTerminalController::class, 'sessions'])->name('sessions-list');

    // Session actions BEFORE resource
    Route::post('sessions/{session}/close', [PosSessionController::class, 'close'])->name('sessions.close');
    Route::get('sessions/{session}/z-report', [PosSessionController::class, 'zReport'])->name('sessions.z-report');
    Route::resource('sessions', PosSessionController::class)->except(['edit', 'update', 'destroy']);

    // Order actions
    Route::post('orders/{order}/refund', [PosOrderController::class, 'refund'])->name('orders.refund');
    Route::get('orders/{order}/pdf',    [PosOrderController::class, 'pdf'])->name('orders.pdf');
    Route::resource('orders', PosOrderController::class)->only(['index', 'store', 'show']);
});
