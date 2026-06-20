<?php

use App\Modules\Discuss\Http\Controllers\DiscussController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', 'verified'])->prefix('discuss')->name('discuss.')->group(function () {
    Route::get('/', [DiscussController::class, 'index'])->name('index');
    Route::post('/', [DiscussController::class, 'store'])->name('store');
    Route::get('users', [DiscussController::class, 'users'])->name('users');

    Route::get('{channel}', [DiscussController::class, 'show'])->name('show');
    Route::post('{channel}/join', [DiscussController::class, 'joinChannel'])->name('join');
    Route::delete('{channel}/leave', [DiscussController::class, 'leaveChannel'])->name('leave');

    Route::post('{channel}/messages', [DiscussController::class, 'sendMessage'])->name('messages.store');
    Route::patch('{channel}/messages/{message}', [DiscussController::class, 'editMessage'])->name('messages.update');
    Route::delete('{channel}/messages/{message}', [DiscussController::class, 'deleteMessage'])->name('messages.destroy');
});
