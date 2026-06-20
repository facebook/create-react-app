<?php

use App\Modules\Purchase\Http\Controllers\PurchaseController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', 'verified'])->prefix('purchase')->name('purchase.')->group(function () {
    Route::get('dashboard', [PurchaseController::class, 'dashboard'])->name('dashboard');

    Route::get('vendors', [PurchaseController::class, 'vendors'])->name('vendors');
    Route::post('vendors', [PurchaseController::class, 'storeVendor'])->name('vendors.store');

    Route::get('rfqs', [PurchaseController::class, 'rfqs'])->name('rfqs');
    Route::post('rfqs', [PurchaseController::class, 'storeRfq'])->name('rfqs.store');
    Route::get('rfqs/{rfq}', [PurchaseController::class, 'showRfq'])->name('rfqs.show');
    Route::post('rfqs/{rfq}/lines', [PurchaseController::class, 'addRfqLine'])->name('rfqs.lines.store');
    Route::post('rfqs/{rfq}/send', [PurchaseController::class, 'sendRfq'])->name('rfqs.send');
    Route::post('rfqs/{rfq}/convert', [PurchaseController::class, 'convertToPo'])->name('rfqs.convert');

    Route::get('pos', [PurchaseController::class, 'pos'])->name('pos');
    Route::get('pos/{po}', [PurchaseController::class, 'showPo'])->name('pos.show');
    Route::post('pos/{po}/confirm', [PurchaseController::class, 'confirmPo'])->name('pos.confirm');
    Route::post('pos/{po}/receive', [PurchaseController::class, 'receivePo'])->name('pos.receive');
});
