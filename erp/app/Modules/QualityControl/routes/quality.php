<?php

use App\Modules\QualityControl\Http\Controllers\QualityControlController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', 'verified'])->prefix('quality')->name('quality.')->group(function () {
    Route::get('dashboard', [QualityControlController::class, 'dashboard'])->name('dashboard');

    // Checklists
    Route::get('checklists', [QualityControlController::class, 'checklists'])->name('checklists.index');
    Route::post('checklists', [QualityControlController::class, 'storeChecklist'])->name('checklists.store');
    Route::post('checklists/{checklist}/items', [QualityControlController::class, 'storeChecklistItem'])->name('checklists.items.store');

    // Inspections
    Route::get('inspections', [QualityControlController::class, 'inspections'])->name('inspections.index');
    Route::post('inspections', [QualityControlController::class, 'createInspection'])->name('inspections.store');
    Route::post('inspections/{inspection}/start', [QualityControlController::class, 'startInspection'])->name('inspections.start');
    Route::post('inspections/{inspection}/results', [QualityControlController::class, 'submitResults'])->name('inspections.results');

    // NCRs
    Route::get('ncrs', [QualityControlController::class, 'ncrs'])->name('ncrs.index');
    Route::post('ncrs', [QualityControlController::class, 'storeNcr'])->name('ncrs.store');
    Route::post('ncrs/{ncr}/resolve', [QualityControlController::class, 'resolveNcr'])->name('ncrs.resolve');
});
