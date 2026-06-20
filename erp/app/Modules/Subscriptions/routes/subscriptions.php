<?php

use App\Modules\Subscriptions\Http\Controllers\SubscriptionController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', 'verified'])->prefix('subscriptions')->name('subscriptions.')->group(function () {
    Route::get('metrics', [SubscriptionController::class, 'metrics'])->name('metrics');
    Route::get('plans', [SubscriptionController::class, 'plans'])->name('plans.index');
    Route::post('plans', [SubscriptionController::class, 'storePlan'])->name('plans.store');
    Route::post('{subscription}/cancel', [SubscriptionController::class, 'cancel'])->name('cancel');
    Route::post('{subscription}/renew', [SubscriptionController::class, 'renew'])->name('renew');
    Route::post('{subscription}/invoices/{invoice}/pay', [SubscriptionController::class, 'payInvoice'])->name('invoices.pay');
    Route::get('', [SubscriptionController::class, 'index'])->name('index');
    Route::post('', [SubscriptionController::class, 'store'])->name('store');
    Route::get('{subscription}', [SubscriptionController::class, 'show'])->name('show');
});
