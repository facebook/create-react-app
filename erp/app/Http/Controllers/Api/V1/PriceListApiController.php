<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Finance\Models\PriceList;
use App\Modules\Finance\Models\PriceListItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PriceListApiController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $tenantId  = $this->tenantId($request);
        $priceLists = PriceList::where('tenant_id', $tenantId)
            ->when($request->boolean('active_only'), fn ($q) => $q->where('is_active', true))
            ->withCount('items')
            ->orderByDesc('is_default')
            ->get();

        return $this->success($priceLists);
    }

    public function store(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'name'             => ['required', 'string', 'max:100'],
            'description'      => ['nullable', 'string'],
            'currency_code'    => ['nullable', 'string', 'max:3'],
            'discount_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'valid_from'       => ['nullable', 'date'],
            'valid_to'         => ['nullable', 'date', 'after_or_equal:valid_from'],
            'is_default'       => ['boolean'],
        ]);

        if (! empty($data['is_default'])) {
            PriceList::where('tenant_id', $tenantId)->update(['is_default' => false]);
        }

        $priceList = PriceList::create([...$data, 'tenant_id' => $tenantId, 'is_active' => true]);

        return $this->success($priceList, 201);
    }

    public function show(PriceList $priceList): JsonResponse
    {
        return $this->success($priceList->load('items.product:id,name,sku'));
    }

    public function update(Request $request, PriceList $priceList): JsonResponse
    {
        $data = $request->validate([
            'name'             => ['sometimes', 'string', 'max:100'],
            'description'      => ['nullable', 'string'],
            'discount_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'valid_from'       => ['nullable', 'date'],
            'valid_to'         => ['nullable', 'date'],
            'is_active'        => ['boolean'],
            'is_default'       => ['boolean'],
        ]);

        if (! empty($data['is_default'])) {
            PriceList::where('tenant_id', $priceList->tenant_id)->update(['is_default' => false]);
        }

        $priceList->update($data);

        return $this->success($priceList->fresh());
    }

    public function destroy(PriceList $priceList): JsonResponse
    {
        $priceList->items()->delete();
        $priceList->delete();

        return $this->success(['message' => 'Price list deleted.']);
    }

    // ── Price List Items ──────────────────────────────────────────────────────

    public function addItem(Request $request, PriceList $priceList): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'product_id'   => ['required', 'integer', 'exists:products,id'],
            'unit_price'   => ['required', 'numeric', 'min:0'],
            'min_quantity' => ['nullable', 'integer', 'min:1'],
        ]);

        $item = PriceListItem::updateOrCreate(
            ['price_list_id' => $priceList->id, 'product_id' => $data['product_id'], 'min_quantity' => $data['min_quantity'] ?? 1],
            ['tenant_id' => $tenantId, 'unit_price' => $data['unit_price']]
        );

        return $this->success($item->load('product:id,name,sku'), 201);
    }

    public function removeItem(PriceList $priceList, PriceListItem $item): JsonResponse
    {
        $item->delete();
        return $this->success(['message' => 'Item removed.']);
    }

    public function lookup(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'price_list_id' => ['required', 'integer', 'exists:price_lists,id'],
            'product_id'    => ['required', 'integer', 'exists:products,id'],
            'quantity'      => ['nullable', 'numeric', 'min:1'],
        ]);

        $priceList = PriceList::where('tenant_id', $tenantId)->findOrFail($data['price_list_id']);
        $price     = $priceList->getPriceForProduct($data['product_id'], $data['quantity'] ?? 1);

        return $this->success([
            'price_list_id' => $data['price_list_id'],
            'product_id'    => $data['product_id'],
            'quantity'      => $data['quantity'] ?? 1,
            'unit_price'    => $price,
            'has_override'  => $price !== null,
        ]);
    }

    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }
}
