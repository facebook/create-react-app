<?php

use App\Modules\Events\Http\Controllers\EventController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', 'verified'])->prefix('events')->name('events.')->group(function () {
    Route::post('{event}/publish', [EventController::class, 'publish'])->name('publish');
    Route::post('{event}/cancel', [EventController::class, 'cancel'])->name('cancel');
    Route::post('{event}/register', [EventController::class, 'register'])->name('register');
    Route::post('{event}/registrations/{registration}/confirm', [EventController::class, 'confirmRegistration'])->name('registrations.confirm');
    Route::post('{event}/registrations/{registration}/attend', [EventController::class, 'markAttended'])->name('registrations.attend');
    Route::post('{event}/registrations/{registration}/cancel', [EventController::class, 'cancelRegistration'])->name('registrations.cancel');
    Route::get('', [EventController::class, 'index'])->name('index');
    Route::post('', [EventController::class, 'store'])->name('store');
    Route::get('{event}', [EventController::class, 'show'])->name('show');
    Route::patch('{event}', [EventController::class, 'update'])->name('update');
    Route::delete('{event}', [EventController::class, 'destroy'])->name('destroy');
});
