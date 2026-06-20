<?php

use App\Modules\Sign\Http\Controllers\SignController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', 'verified'])->prefix('sign')->name('sign.')->group(function () {
    Route::post('{signRequest}/send', [SignController::class, 'send'])->name('send');
    Route::post('{signRequest}/cancel', [SignController::class, 'cancel'])->name('cancel');
    Route::post('{signRequest}/signers', [SignController::class, 'addSigner'])->name('signers.store');
    Route::delete('{signRequest}/signers/{signer}', [SignController::class, 'removeSigner'])->name('signers.destroy');
    Route::post('{signRequest}/signers/{signer}/sign', [SignController::class, 'sign'])->name('signers.sign');
    Route::post('{signRequest}/signers/{signer}/decline', [SignController::class, 'decline'])->name('signers.decline');
    Route::get('', [SignController::class, 'index'])->name('index');
    Route::post('', [SignController::class, 'store'])->name('store');
    Route::get('{signRequest}', [SignController::class, 'show'])->name('show');
    Route::delete('{signRequest}', [SignController::class, 'destroy'])->name('destroy');
});
