<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\ProductAttribute;
use App\Modules\Inventory\Models\ProductVariant;
use App\Modules\Inventory\Models\ProductVariantValue;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductVariantController extends ApiController
{
    // ── Attributes ────────────────────────────────────────────────

    public function indexAttributes(Request $request): JsonResponse
    {
        $tenantId   = $this->tenantId($request);
        $attributes = ProductAttribute::where('tenant_id', $tenantId)->get();
        return $this->success($attributes);
    }

    public function storeAttribute(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'name'    => ['required', 'string', 'max:100'],
            'type'    => ['required', 'in:text,select,color,size'],
            'options' => ['nullable', 'array'],
        ]);

        $attribute = ProductAttribute::create([...$data, 'tenant_id' => $tenantId]);
        return $this->success($attribute, 201);
    }

    public function updateAttribute(Request $request, ProductAttribute $productAttribute): JsonResponse
    {
        $data = $request->validate([
            'name'    => ['sometimes', 'string', 'max:100'],
            'type'    => ['sometimes', 'in:text,select,color,size'],
            'options' => ['nullable', 'array'],
        ]);

        $productAttribute->update($data);
        return $this->success($productAttribute->fresh());
    }

    public function destroyAttribute(ProductAttribute $productAttribute): JsonResponse
    {
        $productAttribute->delete();
        return $this->success(['message' => 'Attribute deleted.']);
    }

    // ── Variants ─────────────────────────────────────────────────

    public function index(Request $request, Product $product): JsonResponse
    {
        $variants = $product->variants()->with('values.attribute')->get();
        return $this->success($variants);
    }

    public function store(Request $request, Product $product): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $data = $request->validate([
            'name'             => ['required', 'string', 'max:255'],
            'sku'              => ['required', 'string', 'unique:product_variants,sku'],
            'price_adjustment' => ['nullable', 'numeric'],
            'stock_quantity'   => ['nullable', 'integer', 'min:0'],
            'attributes'       => ['nullable', 'array'],
            'attributes.*.attribute_id' => ['required', 'exists:product_attributes,id'],
            'attributes.*.value'        => ['required', 'string'],
        ]);

        $variant = ProductVariant::create([
            'tenant_id'        => $tenantId,
            'product_id'       => $product->id,
            'name'             => $data['name'],
            'sku'              => $data['sku'],
            'price_adjustment' => $data['price_adjustment'] ?? 0,
            'stock_quantity'   => $data['stock_quantity'] ?? 0,
        ]);

        foreach ($data['attributes'] ?? [] as $attr) {
            ProductVariantValue::create([
                'tenant_id'    => $tenantId,
                'variant_id'   => $variant->id,
                'attribute_id' => $attr['attribute_id'],
                'value'        => $attr['value'],
            ]);
        }

        return $this->success($variant->load('values.attribute'), 201);
    }

    public function update(Request $request, Product $product, ProductVariant $variant): JsonResponse
    {
        $data = $request->validate([
            'name'             => ['sometimes', 'string', 'max:255'],
            'price_adjustment' => ['sometimes', 'numeric'],
            'stock_quantity'   => ['sometimes', 'integer', 'min:0'],
            'is_active'        => ['sometimes', 'boolean'],
        ]);

        $variant->update($data);
        return $this->success($variant->fresh()->load('values.attribute'));
    }

    public function destroy(Product $product, ProductVariant $variant): JsonResponse
    {
        $variant->delete();
        return $this->success(['message' => 'Variant deleted.']);
    }

    public function matrix(Request $request, Product $product): JsonResponse
    {
        $variants    = $product->variants()->with('values.attribute')->active()->get();
        $attributes  = $variants->flatMap(fn ($v) => $v->values)->pluck('attribute')->unique('id')->values();

        return $this->success([
            'product'    => $product->only(['id', 'name', 'sale_price']),
            'attributes' => $attributes,
            'variants'   => $variants->map(fn ($v) => [
                'id'               => $v->id,
                'name'             => $v->name,
                'sku'              => $v->sku,
                'price_adjustment' => $v->price_adjustment,
                'effective_price'  => $v->effective_price,
                'stock_quantity'   => $v->stock_quantity,
                'is_active'        => $v->is_active,
                'attributes'       => $v->values->mapWithKeys(fn ($val) => [$val->attribute?->name => $val->value]),
            ]),
        ]);
    }

    private function tenantId(Request $request): int
    {
        return app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
    }
}
