<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Webhook;
use App\Models\WebhookDelivery;
use App\Services\WebhookService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WebhookApiController extends ApiController
{
    public static array $supportedEvents = [
        'invoice.created', 'invoice.paid', 'invoice.cancelled',
        'contact.created', 'contact.updated',
        'product.low_stock',
        'payment.received',
        'purchase_order.approved',
        'employee.hired', 'leave.approved',
    ];

    public function index(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);
        $webhooks = Webhook::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->withCount('deliveries')
            ->latest()
            ->get();

        return $this->success($webhooks);
    }

    public function store(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'name'      => ['required', 'string', 'max:255'],
            'url'       => ['required', 'url'],
            'events'    => ['required', 'array', 'min:1'],
            'events.*'  => ['string', 'in:' . implode(',', self::$supportedEvents)],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $webhook = Webhook::create([
            ...$data,
            'tenant_id' => $tenantId,
            'secret'    => Str::random(32),
        ]);

        return $this->success($webhook, 201);
    }

    public function show(Webhook $webhook): JsonResponse
    {
        return $this->success($webhook->load('deliveries'));
    }

    public function update(Request $request, Webhook $webhook): JsonResponse
    {
        $data = $request->validate([
            'name'      => ['sometimes', 'string', 'max:255'],
            'url'       => ['sometimes', 'url'],
            'events'    => ['sometimes', 'array', 'min:1'],
            'events.*'  => ['string', 'in:' . implode(',', self::$supportedEvents)],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $webhook->update($data);
        return $this->success($webhook->fresh());
    }

    public function destroy(Webhook $webhook): JsonResponse
    {
        $webhook->delete();
        return $this->success(['message' => 'Webhook deleted.']);
    }

    public function deliveries(Webhook $webhook): JsonResponse
    {
        $deliveries = $webhook->deliveries()
            ->latest()
            ->paginate(20);

        return $this->paginated($deliveries);
    }

    public function ping(Request $request, Webhook $webhook): JsonResponse
    {
        $tenantId = $this->tenantId($request);
        $delivery = WebhookService::send($webhook, 'ping', [
            'tenant_id' => $tenantId,
            'message'   => 'Webhook test ping from ERP',
            'timestamp' => now()->toIso8601String(),
        ]);

        return $this->success([
            'delivery_id'     => $delivery->id,
            'success'         => $delivery->delivered_at !== null,
            'response_status' => $delivery->response_status,
        ]);
    }

    public function rotateSecret(Webhook $webhook): JsonResponse
    {
        $webhook->update(['secret' => Str::random(32)]);
        return $this->success(['secret' => $webhook->fresh()->secret]);
    }

    public function events(): JsonResponse
    {
        return $this->success(self::$supportedEvents);
    }

    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }
}
