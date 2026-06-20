<?php

use App\Modules\Rental\Http\Controllers\RentalController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', 'verified'])->prefix('rental')->name('rental.')->group(function () {
    // Custom action routes BEFORE resource
    Route::post('items/{item}/rent', [RentalController::class, 'rent'])->name('items.rent');
    Route::post('items/{item}/return', [RentalController::class, 'returnItem'])->name('items.return');
    Route::get('calendar', [RentalController::class, 'calendar'])->name('calendar');
    Route::get('agreements', [RentalController::class, 'agreements'])->name('agreements');
    Route::resource('items', RentalController::class)->except(['create', 'edit']);
});
