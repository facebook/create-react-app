<?php

use App\Modules\SocialMarketing\Http\Controllers\SocialMarketingController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', 'verified'])->prefix('social-marketing')->name('social-marketing.')->group(function () {
    Route::get('dashboard', [SocialMarketingController::class, 'dashboard'])->name('dashboard');
    Route::get('accounts', [SocialMarketingController::class, 'accounts'])->name('accounts');
    Route::post('accounts', [SocialMarketingController::class, 'storeAccount'])->name('accounts.store');
    Route::post('accounts/{account}/toggle', [SocialMarketingController::class, 'toggleAccount'])->name('accounts.toggle');
    Route::get('posts', [SocialMarketingController::class, 'posts'])->name('posts');
    Route::get('posts/create', [SocialMarketingController::class, 'createPost'])->name('posts.create');
    Route::post('posts', [SocialMarketingController::class, 'storePost'])->name('posts.store');
    Route::patch('posts/{post}', [SocialMarketingController::class, 'updatePost'])->name('posts.update');
    Route::post('posts/{post}/publish', [SocialMarketingController::class, 'publishPost'])->name('posts.publish');
    Route::post('posts/{post}/schedule', [SocialMarketingController::class, 'schedulePost'])->name('posts.schedule');
    Route::delete('posts/{post}', [SocialMarketingController::class, 'deletePost'])->name('posts.destroy');
});
