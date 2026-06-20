<?php

use App\Modules\Website\Http\Controllers\WebsiteController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', 'verified'])->prefix('website')->name('website.')->group(function () {
    Route::get('dashboard', [WebsiteController::class, 'dashboard'])->name('dashboard');

    // Pages
    Route::get('pages', [WebsiteController::class, 'pages'])->name('pages');
    Route::post('pages', [WebsiteController::class, 'storePage'])->name('pages.store');
    Route::put('pages/{page}', [WebsiteController::class, 'updatePage'])->name('pages.update');
    Route::post('pages/{page}/publish', [WebsiteController::class, 'publishPage'])->name('pages.publish');

    // Blog
    Route::get('blog', [WebsiteController::class, 'posts'])->name('blog');
    Route::post('blog', [WebsiteController::class, 'storePost'])->name('blog.store');
    Route::post('blog/{post}/publish', [WebsiteController::class, 'publishPost'])->name('blog.publish');

    // Menus
    Route::get('menus', [WebsiteController::class, 'menus'])->name('menus');
    Route::post('menus', [WebsiteController::class, 'storeMenu'])->name('menus.store');
    Route::put('menus/{menu}', [WebsiteController::class, 'updateMenu'])->name('menus.update');
});
