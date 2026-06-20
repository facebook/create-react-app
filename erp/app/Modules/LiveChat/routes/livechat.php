<?php

use App\Modules\LiveChat\Http\Controllers\ChatWidgetController;
use App\Modules\LiveChat\Http\Controllers\LiveChatController;
use Illuminate\Support\Facades\Route;

// Authenticated UI routes
Route::middleware(['web', 'auth', 'verified'])->prefix('live-chat')->name('live-chat.')->group(function () {
    Route::get('dashboard', [LiveChatController::class, 'dashboard'])->name('dashboard');
    Route::get('channels', [LiveChatController::class, 'channels'])->name('channels');
    Route::post('channels', [LiveChatController::class, 'storeChannel'])->name('channels.store');
    Route::get('sessions', [LiveChatController::class, 'sessions'])->name('sessions');
    Route::get('sessions/{session}', [LiveChatController::class, 'show'])->name('sessions.show');
    Route::post('sessions/{session}/assign', [LiveChatController::class, 'assign'])->name('sessions.assign');
    Route::post('sessions/{session}/resolve', [LiveChatController::class, 'resolve'])->name('sessions.resolve');
    Route::post('sessions/{session}/messages', [LiveChatController::class, 'sendMessage'])->name('sessions.messages.store');
    Route::post('sessions/{session}/rate', [LiveChatController::class, 'rate'])->name('sessions.rate');
});

// Public widget API (no auth)
Route::prefix('chat-widget')->name('chat-widget.')->group(function () {
    Route::post('session', [ChatWidgetController::class, 'createSession'])->name('session.create');
    Route::post('message', [ChatWidgetController::class, 'sendVisitorMessage'])->name('message.send');
    Route::get('messages', [ChatWidgetController::class, 'getMessages'])->name('messages.get');
});
