<?php

use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\CompanySettingsController;
use App\Http\Controllers\QueueMonitorController;
use App\Http\Controllers\TwoFactorController;
use App\Http\Controllers\WebhookController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExecutiveDashboardController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\Api\ApiDocsController;
use App\Modules\Core\Http\Controllers\AuditLogController as CoreAuditLogController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Modules\Core\Http\Controllers\NotificationRuleController;
use App\Modules\Core\Http\Controllers\SsoController;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin'       => Route::has('login'),
        'canRegister'    => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion'     => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::prefix('settings')->middleware(['auth', 'verified'])->group(function () {
    Route::get('users',                          [UserManagementController::class, 'index'])->name('settings.users.index');
    Route::post('users/invite',                  [UserManagementController::class, 'invite'])->name('settings.users.invite');
    Route::patch('users/{user}/role',            [UserManagementController::class, 'updateRole'])->name('settings.users.update-role');
    Route::patch('users/{user}/toggle-active',   [UserManagementController::class, 'toggleActive'])->name('settings.users.toggle-active');
    Route::delete('users/{user}',                [UserManagementController::class, 'destroy'])->name('settings.users.destroy');

    Route::get('company',        [CompanySettingsController::class, 'show'])->name('settings.company.show');
    Route::patch('company',      [CompanySettingsController::class, 'update'])->name('settings.company.update');
    Route::post('company/logo',  [CompanySettingsController::class, 'uploadLogo'])->name('settings.company.logo');

    Route::get('audit-log', [AuditLogController::class, 'index'])->name('settings.audit-log');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/audit-logs', [CoreAuditLogController::class, 'index'])->name('audit-logs.index');
});

// Two-Factor Authentication
Route::middleware(['web', 'auth'])->prefix('2fa')->name('2fa.')->group(function () {
    Route::get('setup',     [TwoFactorController::class, 'setup'])->name('setup');
    Route::post('enable',   [TwoFactorController::class, 'enable'])->name('enable');
    Route::post('disable',  [TwoFactorController::class, 'disable'])->name('disable');
    Route::get('challenge', [TwoFactorController::class, 'challenge'])->name('challenge');
    Route::post('verify',   [TwoFactorController::class, 'verify'])->name('verify');
});

// Outbound Webhooks
Route::middleware(['web', 'auth', 'verified'])->group(function () {
    Route::get('settings/webhooks/{webhook}/deliveries', [WebhookController::class, 'deliveries'])->name('webhooks.deliveries');
    Route::post('settings/webhooks/{webhook}/test',      [WebhookController::class, 'test'])->name('webhooks.test');
    Route::resource('settings/webhooks', WebhookController::class)->names('webhooks');
});

// Audit Log UI (admin)
Route::middleware(['web', 'auth', 'verified'])->group(function () {
    Route::get('admin/audit-log/{log}', [\App\Http\Controllers\Admin\AuditLogController::class, 'show'])->name('admin.audit-log.show');
});

require __DIR__ . '/auth.php';

// Public Customer Portal (no auth required)
Route::get('/portal/{token}', [\App\Modules\Finance\Http\Controllers\CustomerPortalController::class, 'show'])->name('portal.show');
Route::get('/portal/{token}/invoices/{invoice}', [\App\Modules\Finance\Http\Controllers\CustomerPortalController::class, 'invoice'])->name('portal.invoice');


Route::middleware(['auth', 'verified'])->group(function () {
    // Notification Rules
    Route::resource('notification-rules', NotificationRuleController::class)->except(['edit', 'update', 'show']);
    Route::patch('notification-rules/{notificationRule}/toggle', [NotificationRuleController::class, 'toggle'])->name('notification-rules.toggle');
});

Route::post('/notifications/refresh', function (\Illuminate\Http\Request $request) {
    \App\Services\NotificationService::clearCache($request->user()->tenant_id);
    return back();
})->name('notifications.refresh')->middleware(['auth', 'verified']);

// Executive Dashboard
Route::get('/executive-dashboard', [ExecutiveDashboardController::class, 'index'])
    ->name('executive.dashboard')
    ->middleware(['web', 'auth', 'verified']);

// Bulk Import
Route::middleware(['web', 'auth', 'verified'])->group(function () {
    Route::get('/import',              [ImportController::class, 'index'])->name('import.index');
    Route::post('/import/products',    [ImportController::class, 'products'])->name('import.products');
    Route::post('/import/employees',   [ImportController::class, 'employees'])->name('import.employees');
    Route::post('/import/contacts',    [ImportController::class, 'contacts'])->name('import.contacts');
});

// Global Search
Route::get('/search', App\Http\Controllers\GlobalSearchController::class)
    ->middleware(['web', 'auth', 'verified'])
    ->name('search');

// Queue Monitor
Route::middleware(['web', 'auth', 'verified'])->prefix('queue')->name('queue.')->group(function () {
    Route::get('monitor',                      [QueueMonitorController::class, 'index'])->name('monitor');
    Route::post('failed/{uuid}/retry',         [QueueMonitorController::class, 'retryFailed'])->name('failed.retry');
    Route::delete('failed',                    [QueueMonitorController::class, 'clearFailed'])->name('failed.clear');
});

// SSO Configuration (auth required)
Route::middleware(['web', 'auth', 'verified'])->prefix('settings')->name('sso.')->group(function () {
    Route::get('sso', [SsoController::class, 'configure'])->name('configure');
    Route::post('sso', [SsoController::class, 'store'])->name('store');
    Route::patch('sso/{provider}', [SsoController::class, 'update'])->name('update');
    Route::delete('sso/{provider}', [SsoController::class, 'destroy'])->name('destroy');
});

// SAML endpoints (public — no auth middleware)
Route::prefix('sso/saml')->name('sso.saml.')->group(function () {
    Route::get('{provider}/initiate', [SsoController::class, 'initiate'])->name('initiate');
    Route::post('{provider}/acs', [SsoController::class, 'acs'])->name('acs');
    Route::get('{provider}/metadata', [SsoController::class, 'metadata'])->name('metadata');
});

// API Documentation (public — Swagger UI served via CDN)
Route::get('/api/docs', [ApiDocsController::class, 'ui'])->name('api.docs');
Route::get('/api-docs/openapi.yaml', [ApiDocsController::class, 'spec'])->name('api.docs.spec');
