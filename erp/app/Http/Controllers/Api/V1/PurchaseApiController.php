<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Purchase\Models\Po;
use App\Modules\Purchase\Models\PurchaseRfq;
use App\Modules\Purchase\Models\PurchaseVendor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PurchaseApiController extends ApiController
{
    /**
     * GET /api/v1/purchase/vendors
     */
    public function vendors(Request $request): JsonResponse
    {
        $query = PurchaseVendor::select('id', 'name', 'email', 'currency', 'is_active');

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->query('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $paginator = $query->latest()->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * POST /api/v1/purchase/vendors
     */
    public function storeVendor(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'nullable|email|max:255',
            'phone'    => 'nullable|string|max:50',
            'currency' => 'nullable|string|max:10',
            'is_active' => 'nullable|boolean',
        ]);

        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $validated['tenant_id'] = $tenantId;

        $vendor = PurchaseVendor::create($validated);

        return $this->success($vendor, 201);
    }

    /**
     * GET /api/v1/purchase/rfqs
     */
    public function rfqs(Request $request): JsonResponse
    {
        $query = PurchaseRfq::with('vendor:id,name');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($vendorId = $request->query('po_vendor_id')) {
            $query->where('po_vendor_id', $vendorId);
        }

        $paginator = $query->latest()->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * POST /api/v1/purchase/rfqs
     */
    public function storeRfq(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'po_vendor_id'      => 'required|integer|exists:po_vendors,id',
            'expected_delivery' => 'nullable|date',
            'notes'             => 'nullable|string',
            'currency'          => 'nullable|string|max:10',
        ]);

        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $validated['tenant_id'] = $tenantId;

        $rfq = PurchaseRfq::create($validated);

        return $this->success($rfq, 201);
    }

    /**
     * GET /api/v1/purchase/purchase-orders
     */
    public function purchaseOrders(Request $request): JsonResponse
    {
        $query = Po::with('vendor:id,name')->withCount('lines');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($vendorId = $request->query('po_vendor_id')) {
            $query->where('po_vendor_id', $vendorId);
        }

        $paginator = $query->latest()->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * GET /api/v1/purchase/purchase-orders/{id}
     */
    public function showPurchaseOrder(int $id): JsonResponse
    {
        $po = Po::with(['vendor', 'lines'])->findOrFail($id);

        return $this->success($po);
    }

    /**
     * POST /api/v1/purchase/purchase-orders/{id}/confirm
     */
    public function confirmPurchaseOrder(int $id): JsonResponse
    {
        $po = Po::findOrFail($id);
        $po->confirm();

        return $this->success(['message' => 'Purchase order confirmed']);
    }

    /**
     * POST /api/v1/purchase/purchase-orders/{id}/receive
     */
    public function receivePurchaseOrder(int $id): JsonResponse
    {
        $po = Po::findOrFail($id);
        $po->receive();

        return $this->success(['message' => 'Purchase order received']);
    }
}
