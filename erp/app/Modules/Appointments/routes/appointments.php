<?php

use App\Modules\Appointments\Http\Controllers\AppointmentController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', 'verified'])->prefix('appointments')->name('appointments.')->group(function () {
    Route::get('dashboard', [AppointmentController::class, 'dashboard'])->name('dashboard');
    Route::get('types', [AppointmentController::class, 'types'])->name('types');
    Route::post('types', [AppointmentController::class, 'storeType'])->name('types.store');
    Route::get('slots', [AppointmentController::class, 'slots'])->name('slots');
    Route::post('slots', [AppointmentController::class, 'storeSlot'])->name('slots.store');
    Route::get('/', [AppointmentController::class, 'index'])->name('index');
    Route::post('book', [AppointmentController::class, 'book'])->name('book');
    Route::post('{appointment}/confirm', [AppointmentController::class, 'confirm'])->name('confirm');
    Route::post('{appointment}/cancel', [AppointmentController::class, 'cancel'])->name('cancel');
    Route::post('{appointment}/complete', [AppointmentController::class, 'complete'])->name('complete');
});
