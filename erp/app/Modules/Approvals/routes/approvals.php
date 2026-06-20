<?php

use App\Modules\Approvals\Http\Controllers\ApprovalsDashboardController;
use App\Modules\Approvals\Http\Controllers\ApprovalRequestController;
use App\Modules\Approvals\Http\Controllers\ApprovalWorkflowController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', 'verified'])->prefix('approvals')->name('approvals.')->group(function () {
    Route::get('dashboard', [ApprovalsDashboardController::class, 'index'])->name('dashboard');
    Route::get('my-pending', [ApprovalRequestController::class, 'myPending'])->name('requests.my-pending');

    // Request actions BEFORE resource
    Route::post('requests/{approvalRequest}/approve', [ApprovalRequestController::class, 'approve'])->name('requests.approve');
    Route::post('requests/{approvalRequest}/reject',  [ApprovalRequestController::class, 'reject'])->name('requests.reject');
    Route::post('requests/{approvalRequest}/cancel',  [ApprovalRequestController::class, 'cancel'])->name('requests.cancel');
    Route::resource('requests', ApprovalRequestController::class)->only(['index', 'show'])->parameters(['requests' => 'approvalRequest']);

    Route::resource('workflows', ApprovalWorkflowController::class);
});
