<?php

namespace App\Modules\Ecommerce\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Ecommerce\Models\StoreOrder;
use App\Modules\Ecommerce\Models\StoreOrderItem;
use App\Modules\Ecommerce\Models\StoreProduct;
use App\Modules\Ecommerce\Models\StoreSettings;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;

class StorefrontController extends Controller
{
    public function index(string $slug): Response
    {
        $store = StoreSettings::where('store_slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        $featuredProducts = StoreProduct::with('product')
            ->where('tenant_id', $store->tenant_id)
            ->where('is_featured', true)
            ->where('is_visible', true)
            ->orderBy('sort_order')
            ->limit(12)
            ->get()
            ->map(fn ($sp) => [
                'id'                => $sp->id,
                'store_price'       => $sp->store_price,
                'compare_price'     => $sp->compare_price,
                'short_description' => $sp->short_description,
                'product'           => $sp->product ? [
                    'name' => $sp->product->name,
                    'sku'  => $sp->product->sku,
                ] : null,
            ]);

        return Inertia::render('Ecommerce/Storefront/Index', [
            'store'            => $store,
            'featuredProducts' => $featuredProducts,
        ]);
    }

    public function products(Request $request, string $slug): Response
    {
        $store = StoreSettings::where('store_slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        $products = StoreProduct::with(['product', 'category'])
            ->where('tenant_id', $store->tenant_id)
            ->where('is_visible', true)
            ->when($request->category_id, fn ($q) => $q->where('category_id', $request->category_id))
            ->orderBy('sort_order')
            ->paginate(24)
            ->through(fn ($sp) => [
                'id'                => $sp->id,
                'store_price'       => $sp->store_price,
                'compare_price'     => $sp->compare_price,
                'is_featured'       => $sp->is_featured,
                'short_description' => $sp->short_description,
                'product'           => $sp->product ? [
                    'name' => $sp->product->name,
                    'sku'  => $sp->product->sku,
                ] : null,
                'category'          => $sp->category ? ['name' => $sp->category->name] : null,
            ]);

        return Inertia::render('Ecommerce/Storefront/Products', [
            'store'    => $store,
            'products' => $products,
            'filters'  => $request->only(['category_id']),
        ]);
    }

    public function product(string $slug, StoreProduct $storeProduct): Response
    {
        $store = StoreSettings::where('store_slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        $storeProduct->load(['product', 'category']);

        return Inertia::render('Ecommerce/Storefront/Product', [
            'store'        => $store,
            'storeProduct' => [
                'id'               => $storeProduct->id,
                'store_price'      => $storeProduct->store_price,
                'compare_price'    => $storeProduct->compare_price,
                'is_featured'      => $storeProduct->is_featured,
                'short_description' => $storeProduct->short_description,
                'long_description' => $storeProduct->long_description,
                'meta_title'       => $storeProduct->meta_title,
                'meta_description' => $storeProduct->meta_description,
                'discount_percent' => $storeProduct->discountPercent(),
                'product'          => $storeProduct->product ? [
                    'name' => $storeProduct->product->name,
                    'sku'  => $storeProduct->product->sku,
                ] : null,
                'category'         => $storeProduct->category ? ['name' => $storeProduct->category->name] : null,
            ],
        ]);
    }

    public function checkout(Request $request, string $slug): Response
    {
        $store = StoreSettings::where('store_slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        $cartItems = $request->session()->get('cart_' . $slug, []);

        return Inertia::render('Ecommerce/Storefront/Checkout', [
            'store'     => $store,
            'cartItems' => $cartItems,
        ]);
    }

    public function placeOrder(Request $request, string $slug): \Inertia\Response
    {
        $store = StoreSettings::where('store_slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        $data = $request->validate([
            'customer_name'    => 'required|string|max:255',
            'customer_email'   => 'required|email|max:255',
            'customer_phone'   => 'nullable|string|max:50',
            'shipping_address' => 'nullable|string',
            'billing_address'  => 'nullable|string',
            'notes'            => 'nullable|string',
            'payment_method'   => 'required|in:cash_on_delivery,bank_transfer,card',
            'items'            => 'required|array|min:1',
            'items.*.store_product_id' => 'nullable|exists:store_products,id',
            'items.*.product_name'     => 'required|string',
            'items.*.product_sku'      => 'nullable|string',
            'items.*.quantity'         => 'required|integer|min:1',
            'items.*.unit_price'       => 'required|numeric|min:0',
            'items.*.line_total'       => 'required|numeric|min:0',
        ]);

        $subtotal = collect($data['items'])->sum('line_total');

        $order = StoreOrder::create([
            'tenant_id'        => $store->tenant_id,
            'status'           => 'pending',
            'customer_name'    => $data['customer_name'],
            'customer_email'   => $data['customer_email'],
            'customer_phone'   => $data['customer_phone'] ?? null,
            'shipping_address' => $data['shipping_address'] ?? null,
            'billing_address'  => $data['billing_address'] ?? null,
            'subtotal'         => $subtotal,
            'discount_amount'  => 0,
            'shipping_amount'  => 0,
            'tax_amount'       => 0,
            'total'            => $subtotal,
            'payment_method'   => $data['payment_method'],
            'payment_status'   => 'pending',
            'notes'            => $data['notes'] ?? null,
            'ip_address'       => $request->ip(),
        ]);

        $order->order_number = $order->generateOrderNumber();
        $order->save();

        foreach ($data['items'] as $item) {
            StoreOrderItem::create([
                'order_id'         => $order->id,
                'store_product_id' => $item['store_product_id'] ?? null,
                'product_name'     => $item['product_name'],
                'product_sku'      => $item['product_sku'] ?? null,
                'quantity'         => $item['quantity'],
                'unit_price'       => $item['unit_price'],
                'line_total'       => $item['line_total'],
            ]);
        }

        return Inertia::render('Ecommerce/Storefront/OrderConfirmation', [
            'store' => $store,
            'order' => [
                'id'             => $order->id,
                'order_number'   => $order->order_number,
                'customer_name'  => $order->customer_name,
                'customer_email' => $order->customer_email,
                'total'          => $order->total,
                'payment_method' => $order->payment_method,
                'items'          => $order->items->map(fn ($i) => [
                    'product_name' => $i->product_name,
                    'quantity'     => $i->quantity,
                    'unit_price'   => $i->unit_price,
                    'line_total'   => $i->line_total,
                ]),
            ],
        ]);
    }
}
