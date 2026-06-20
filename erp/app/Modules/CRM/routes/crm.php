<?php

use App\Modules\CRM\Http\Controllers\CrmStageController;
use App\Modules\CRM\Http\Controllers\CrmLeadController;
use App\Modules\CRM\Http\Controllers\CrmActivityController;
use App\Modules\CRM\Http\Controllers\CrmDashboardController;
use App\Modules\CRM\Http\Controllers\CrmReportController;
use App\Modules\CRM\Http\Controllers\EmailSequenceController;
use App\Modules\CRM\Http\Controllers\LeadScoringController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', 'verified'])->prefix('crm')->name('crm.')->group(function () {
    Route::get('dashboard', [CrmDashboardController::class, 'index'])->name('dashboard');

    // Stages
    Route::post('stages',           [CrmStageController::class, 'store'])->name('stages.store');
    Route::put('stages/{stage}',    [CrmStageController::class, 'update'])->name('stages.update');
    Route::delete('stages/{stage}', [CrmStageController::class, 'destroy'])->name('stages.destroy');
    Route::get('stages',            [CrmStageController::class, 'index'])->name('stages.index');

    // Pipeline Kanban (before leads resource)
    Route::get('pipeline/kanban', [CrmLeadController::class, 'kanban'])->name('pipeline.kanban');
    Route::patch('leads/{lead}/move-stage', [CrmLeadController::class, 'moveStage'])->name('leads.move-stage');

    // Leads — action routes first
    Route::post('leads/{lead}/mark-won',  [CrmLeadController::class, 'markWon'])->name('leads.mark-won');
    Route::post('leads/{lead}/mark-lost', [CrmLeadController::class, 'markLost'])->name('leads.mark-lost');
    Route::post('leads/{lead}/convert',   [CrmLeadController::class, 'convert'])->name('leads.convert');
    Route::get('pipeline/kanban', [CrmLeadController::class, 'kanban'])->name('pipeline.kanban');
    Route::patch('leads/{lead}/move-stage', [CrmLeadController::class, 'moveStage'])->name('leads.move-stage');
    Route::resource('leads', CrmLeadController::class);

    // Activities (nested under leads + standalone actions)
    Route::post('leads/{lead}/activities',         [CrmActivityController::class, 'store'])->name('leads.activities.store');
    Route::post('activities/{activity}/mark-done', [CrmActivityController::class, 'markDone'])->name('activities.mark-done');
    Route::delete('activities/{activity}',         [CrmActivityController::class, 'destroy'])->name('activities.destroy');

    // Reports
    Route::get('reports/pipeline', [CrmReportController::class, 'pipeline'])->name('reports.pipeline');
    Route::get('reports/win-loss', [CrmReportController::class, 'winLoss'])->name('reports.win-loss');
    Route::get('reports/source',   [CrmReportController::class, 'source'])->name('reports.source');

    // Email Sequences
    Route::post('sequences/{sequence}/steps',                    [EmailSequenceController::class, 'storeStep'])->name('sequences.steps.store');
    Route::post('sequences/{sequence}/enroll',                   [EmailSequenceController::class, 'enroll'])->name('sequences.enroll');
    Route::post('sequences/{sequence}/pause',                    [EmailSequenceController::class, 'pause'])->name('sequences.pause');
    Route::post('sequences/{sequence}/activate',                 [EmailSequenceController::class, 'activate'])->name('sequences.activate');
    Route::post('enrollments/{enrollment}/unsubscribe',          [EmailSequenceController::class, 'unsubscribe'])->name('enrollments.unsubscribe');
    Route::get('sequences/{sequence}',                           [EmailSequenceController::class, 'show'])->name('sequences.show');
    Route::get('sequences',                                      [EmailSequenceController::class, 'index'])->name('sequences.index');
    Route::post('sequences',                                     [EmailSequenceController::class, 'store'])->name('sequences.store');

    // Lead Scoring
    Route::get('scoring/rules',                                  [LeadScoringController::class, 'rules'])->name('scoring.rules');
    Route::post('scoring/rules',                                 [LeadScoringController::class, 'storeRule'])->name('scoring.rules.store');
    Route::delete('scoring/rules/{rule}',                        [LeadScoringController::class, 'destroyRule'])->name('scoring.rules.destroy');
    Route::get('scoring/scores',                                 [LeadScoringController::class, 'scores'])->name('scoring.scores');
    Route::get('leads/{lead}/score',                             [LeadScoringController::class, 'scoreForLead'])->name('leads.score');
});
