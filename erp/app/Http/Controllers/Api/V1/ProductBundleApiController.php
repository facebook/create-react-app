<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Inventory\Models\ProductBundle;
use App\Modules\Inventory\Models\ProductBundleItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductBundleApiController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);
        $bundles  = ProductBundle::where('tenant_id', $tenantId)
            ->when($request->boolean('active_only'), fn ($q) => $q->where('is_active', true))
            ->withCount('items')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($b) => array_merge($b->toArray(), ['calculated_price' => $b->load('items.product')->calculatePrice()]));

        return $this->success($bundles);
    }

    public function store(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'name'         => ['required', 'string', 'max:100'],
            'sku'          => ['nullable', 'string', 'max:50'],
            'description'  => ['nullable', 'string'],
            'bundle_price' => ['nullable', 'numeric', 'min:0'],
            'items'        => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity'   => ['required', 'numeric', 'min:0.001'],
        ]);

        $bundle = ProductBundle::create([
            'tenant_id'    => $tenantId,
            'name'         => $data['name'],
            'sku'          => $data['sku'] ?? null,
            'description'  => $data['description'] ?? null,
            'bundle_price' => $data['bundle_price'] ?? null,
            'is_active'    => true,
        ]);

        foreach ($data['items'] as $item) {
            ProductBundleItem::create([
                'tenant_id'         => $tenantId,
                'product_bundle_id' => $bundle->id,
                'product_id'        => $item['product_id'],
                'quantity'          => $item['quantity'],
            ]);
        }

        $bundle->load('items.product:id,name,sku,sale_price');

        return $this->success(array_merge($bundle->toArray(), ['calculated_price' => $bundle->calculatePrice()]), 201);
    }

    public function show(ProductBundle $productBundle): JsonResponse
    {
        $productBundle->load('items.product:id,name,sku,sale_price');

        return $this->success(array_merge($productBundle->toArray(), ['calculated_price' => $productBundle->calculatePrice()]));
    }

    public function update(Request $request, ProductBundle $productBundle): JsonResponse
    {
        $data = $request->validate([
            'name'         => ['sometimes', 'string', 'max:100'],
            'sku'          => ['nullable', 'string', 'max:50'],
            'description'  => ['nullable', 'string'],
            'bundle_price' => ['nullable', 'numeric', 'min:0'],
            'is_active'    => ['boolean'],
        ]);

        $productBundle->update($data);

        return $this->success($productBundle->fresh()->load('items.product:id,name,sku,sale_price'));
    }

    public function destroy(ProductBundle $productBundle): JsonResponse
    {
        $productBundle->items()->delete();
        $productBundle->delete();

        return $this->success(['message' => 'Bundle deleted.']);
    }

    public function addItem(Request $request, ProductBundle $productBundle): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity'   => ['required', 'numeric', 'min:0.001'],
        ]);

        $item = ProductBundleItem::updateOrCreate(
            ['product_bundle_id' => $productBundle->id, 'product_id' => $data['product_id']],
            ['tenant_id' => $tenantId, 'quantity' => $data['quantity']]
        );

        return $this->success($item->load('product:id,name,sku,sale_price'), 201);
    }

    public function removeItem(ProductBundle $productBundle, ProductBundleItem $item): JsonResponse
    {
        $item->delete();
        return $this->success(['message' => 'Item removed from bundle.']);
    }

    public function price(ProductBundle $productBundle): JsonResponse
    {
        $productBundle->load('items.product');
        $calculatedPrice = $productBundle->calculatePrice();
        $savings = null;

        if ($productBundle->bundle_price !== null) {
            $componentTotal = (float) $productBundle->items->sum(fn ($i) => ($i->product?->sale_price ?? 0) * $i->quantity);
            $savings = $componentTotal > $productBundle->bundle_price
                ? round($componentTotal - $productBundle->bundle_price, 2)
                : 0;
        }

        return $this->success([
            'bundle_id'        => $productBundle->id,
            'calculated_price' => $calculatedPrice,
            'has_fixed_price'  => $productBundle->bundle_price !== null,
            'savings'          => $savings,
        ]);
    }

    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }
}
