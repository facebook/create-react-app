<?php

use App\Modules\Documents\Http\Controllers\DocumentController;

Route::middleware(['web', 'auth', 'verified'])->prefix('documents')->name('documents.')->group(function () {
    Route::get('folders', [DocumentController::class, 'folders'])->name('folders');
    Route::post('folders', [DocumentController::class, 'storeFolder'])->name('folders.store');
    Route::delete('folders/{folder}', [DocumentController::class, 'destroyFolder'])->name('folders.destroy');
    Route::get('search', [DocumentController::class, 'search'])->name('search');
    Route::post('{document}/versions', [DocumentController::class, 'addVersion'])->name('versions.store');
    Route::get('upload', [DocumentController::class, 'uploadPage'])->name('upload.page');
    Route::post('upload', [DocumentController::class, 'upload'])->name('upload');
    Route::get('', [DocumentController::class, 'index'])->name('index');
    Route::post('', [DocumentController::class, 'store'])->name('store');
    Route::get('{document}', [DocumentController::class, 'show'])->name('show');
    Route::patch('{document}', [DocumentController::class, 'update'])->name('update');
    Route::delete('{document}', [DocumentController::class, 'destroy'])->name('destroy');
});
