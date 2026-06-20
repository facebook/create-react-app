<?php
namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Modules\Core\Models\ErpNotification;

class NotificationController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
        $userId = $request->user()->id;

        $notifications = ErpNotification::where('tenant_id', $tenantId)
            ->where('user_id', $userId)
            ->latest()
            ->paginate(20);

        return $this->paginated($notifications);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
        $userId = $request->user()->id;

        $count = ErpNotification::where('tenant_id', $tenantId)
            ->where('user_id', $userId)
            ->whereNull('read_at')
            ->count();

        return $this->success(['count' => $count]);
    }

    public function markRead(Request $request, int $id): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
        $userId = $request->user()->id;

        $notification = ErpNotification::where('tenant_id', $tenantId)
            ->where('user_id', $userId)
            ->findOrFail($id);

        $notification->markAsRead();

        return $this->success(['message' => 'Notification marked as read']);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
        $userId = $request->user()->id;

        ErpNotification::where('tenant_id', $tenantId)
            ->where('user_id', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return $this->success(['message' => 'All notifications marked as read']);
    }
}
