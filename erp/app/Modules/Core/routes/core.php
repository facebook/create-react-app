<?php

use App\Modules\Core\Http\Controllers\AuditLogController;
use App\Modules\Core\Http\Controllers\CompanyController;
use App\Http\Controllers\Admin\AuditLogController as AdminAuditLogController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExportController;
use App\Modules\Core\Http\Controllers\NotificationInboxController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\SettingController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics');

    Route::get('/notifications', [NotificationInboxController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/mark-all-read', [NotificationInboxController::class, 'markAllRead'])->name('notifications.mark-all-read');
    Route::patch('/notifications/{notification}/read', [NotificationInboxController::class, 'markRead'])->name('notifications.read');
    Route::delete('/notifications/{notification}', [NotificationInboxController::class, 'destroy'])->name('notifications.destroy');

    Route::get('/search', SearchController::class)->name('search');

    Route::prefix('export')->name('export.')->group(function () {
        Route::get('products',  [ExportController::class, 'products'])->name('products');
        Route::get('invoices',  [ExportController::class, 'invoices'])->name('invoices');
        Route::get('employees', [ExportController::class, 'employees'])->name('employees');
    });

    Route::get('/settings', [SettingController::class, 'edit'])->name('settings.edit');
    Route::put('/settings', [SettingController::class, 'update'])->name('settings.update');

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::resource('users', UserController::class)->names('users');
        Route::get('audit-log', [AdminAuditLogController::class, 'index'])->name('audit-log.index');
    });

    Route::middleware(['web', 'auth', 'verified'])->prefix('core')->name('core.')->group(function () {
        Route::resource('audit-logs', AuditLogController::class)->only(['index', 'show']);
        Route::resource('companies', CompanyController::class);
    });
});
