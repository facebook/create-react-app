<?php

namespace App\Services;

use App\Modules\Core\Models\ErpNotification;
use App\Modules\Finance\Models\Invoice;
use App\Modules\HR\Models\LeaveRequest;
use App\Modules\Inventory\Models\Product;
use App\Events\Notifications\ErpNotification as ErpNotificationEvent;
use Illuminate\Support\Facades\Cache;

class NotificationService
{
    /**
     * Send a persistent in-app notification and broadcast via WebSocket.
     */
    public static function send(int $tenantId, int $userId, string $type, string $title, string $message, array $data = []): ErpNotification
    {
        $notification = ErpNotification::create([
            'tenant_id' => $tenantId,
            'user_id'   => $userId,
            'type'      => $type,
            'title'     => $title,
            'message'   => $message,
            'data'      => $data,
        ]);

        broadcast(new ErpNotificationEvent($tenantId, $type, $title, $message, $data));

        return $notification;
    }

    /**
     * Get summary notifications for sidebar bell (cached, page-load driven).
     */
    public static function forUser(\App\Models\User $user): array
    {
        $tenantId = $user->tenant_id;
        $cacheKey = "notifications.{$tenantId}.{$user->id}";

        // Cache for 5 minutes to avoid N+1 on every page load
        return Cache::remember($cacheKey, 300, function () use ($user, $tenantId) {
            $items = [];

            // 1. Overdue invoices (finance.view permission required)
            if ($user->hasAnyPermission(['finance.view', 'finance.create'])) {
                $overdueCount = Invoice::where('tenant_id', $tenantId)
                    ->whereNotIn('status', ['paid', 'cancelled'])
                    ->whereNotNull('due_date')
                    ->where('due_date', '<', now()->startOfDay())
                    ->count();

                if ($overdueCount > 0) {
                    $items[] = [
                        'type'     => 'overdue_invoices',
                        'label'    => "{$overdueCount} overdue invoice" . ($overdueCount > 1 ? 's' : ''),
                        'href'     => '/finance/invoices?status=overdue',
                        'count'    => $overdueCount,
                        'severity' => 'warning',
                    ];
                }
            }

            // 2. Low stock (inventory.view permission required)
            if ($user->hasAnyPermission(['inventory.view', 'inventory.create'])) {
                $lowStockCount = Product::where('tenant_id', $tenantId)
                    ->where('is_active', true)
                    ->with('stockLevels')
                    ->get()
                    ->filter(fn ($p) => $p->stockLevels->sum('quantity') < 10)
                    ->count();

                if ($lowStockCount > 0) {
                    $items[] = [
                        'type'     => 'low_stock',
                        'label'    => "{$lowStockCount} product" . ($lowStockCount > 1 ? 's' : '') . ' low on stock',
                        'href'     => '/inventory/products',
                        'count'    => $lowStockCount,
                        'severity' => 'warning',
                    ];
                }
            }

            // 3. Pending leave requests (hr.view + admin/manager role)
            if ($user->hasAnyRole(['super-admin', 'admin', 'manager']) && $user->hasAnyPermission(['hr.view', 'hr.create'])) {
                $pendingLeave = LeaveRequest::where('tenant_id', $tenantId)
                    ->where('status', 'pending')
                    ->count();

                if ($pendingLeave > 0) {
                    $items[] = [
                        'type'     => 'pending_leave',
                        'label'    => "{$pendingLeave} pending leave request" . ($pendingLeave > 1 ? 's' : ''),
                        'href'     => '/hr/leave-requests',
                        'count'    => $pendingLeave,
                        'severity' => 'info',
                    ];
                }
            }

            return $items;
        });
    }

    public static function clearCache(int $tenantId): void
    {
        // Clear notification cache for all users in the tenant
        foreach (\App\Models\User::where('tenant_id', $tenantId)->pluck('id') as $userId) {
            Cache::forget("notifications.{$tenantId}.{$userId}");
        }
    }
}
