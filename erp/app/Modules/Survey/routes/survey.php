<?php

use App\Modules\Survey\Http\Controllers\SurveyController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', 'verified'])->prefix('surveys')->name('surveys.')->group(function () {
    Route::post('{survey}/publish', [SurveyController::class, 'publish'])->name('publish');
    Route::post('{survey}/close', [SurveyController::class, 'close'])->name('close');
    Route::post('{survey}/questions', [SurveyController::class, 'addQuestion'])->name('questions.store');
    Route::delete('{survey}/questions/{question}', [SurveyController::class, 'removeQuestion'])->name('questions.destroy');
    Route::post('{survey}/respond', [SurveyController::class, 'respond'])->name('respond');
    Route::get('{survey}/results', [SurveyController::class, 'results'])->name('results');
    Route::get('', [SurveyController::class, 'index'])->name('index');
    Route::post('', [SurveyController::class, 'store'])->name('store');
    Route::get('{survey}', [SurveyController::class, 'show'])->name('show');
    Route::patch('{survey}', [SurveyController::class, 'update'])->name('update');
    Route::delete('{survey}', [SurveyController::class, 'destroy'])->name('destroy');
});
