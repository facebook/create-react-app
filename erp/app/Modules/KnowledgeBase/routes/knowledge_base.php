<?php

use App\Modules\KnowledgeBase\Http\Controllers\KnowledgeBaseController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', 'verified'])->prefix('kb')->name('kb.')->group(function () {
    Route::get('categories', [KnowledgeBaseController::class, 'categories'])->name('categories');
    Route::post('categories', [KnowledgeBaseController::class, 'storeCategory'])->name('categories.store');
    Route::get('search', [KnowledgeBaseController::class, 'search'])->name('search');
    Route::post('{article}/publish', [KnowledgeBaseController::class, 'publish'])->name('publish');
    Route::post('{article}/archive', [KnowledgeBaseController::class, 'archive'])->name('archive');
    Route::get('', [KnowledgeBaseController::class, 'index'])->name('index');
    Route::post('', [KnowledgeBaseController::class, 'store'])->name('store');
    Route::get('{article}', [KnowledgeBaseController::class, 'show'])->name('show');
    Route::patch('{article}', [KnowledgeBaseController::class, 'update'])->name('update');
    Route::delete('{article}', [KnowledgeBaseController::class, 'destroy'])->name('destroy');
});
