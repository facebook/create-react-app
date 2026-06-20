<?php

namespace App\Modules\Ecommerce\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Ecommerce\Models\StoreCart;
use App\Modules\Ecommerce\Models\StoreProduct;
use App\Modules\Ecommerce\Models\StoreSettings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    private function getSessionKey(Request $request): string
    {
        return $request->session()->getId();
    }

    public function index(Request $request, string $slug): Response
    {
        $store = StoreSettings::where('store_slug', $slug)->where('is_active', true)->firstOrFail();

        $sessionKey = $this->getSessionKey($request);
        $cartItems = StoreCart::getOrCreateForSession($sessionKey)
            ->filter(fn ($item) => $item->tenant_id === null || $item->tenant_id === $store->tenant_id)
            ->map(fn ($item) => [
                'id'               => $item->id,
                'quantity'         => $item->quantity,
                'store_product_id' => $item->store_product_id,
                'product_name'     => $item->product?->product?->name ?? 'Product',
                'product_sku'      => $item->product?->product?->sku,
                'unit_price'       => $item->product?->store_price ?? 0,
                'line_total'       => ($item->product?->store_price ?? 0) * $item->quantity,
            ])->values();

        return Inertia::render('Ecommerce/Storefront/Cart', [
            'store'     => $store,
            'cartItems' => $cartItems,
        ]);
    }

    public function add(Request $request, string $slug): RedirectResponse
    {
        $store = StoreSettings::where('store_slug', $slug)->where('is_active', true)->firstOrFail();

        $data = $request->validate([
            'store_product_id' => 'required|exists:store_products,id',
            'quantity'         => 'required|integer|min:1',
        ]);

        $product = StoreProduct::where('id', $data['store_product_id'])
            ->where('tenant_id', $store->tenant_id)
            ->where('is_visible', true)
            ->firstOrFail();

        $sessionKey = $this->getSessionKey($request);

        $existing = StoreCart::where('session_key', $sessionKey)
            ->where('store_product_id', $product->id)
            ->first();

        if ($existing) {
            $existing->increment('quantity', $data['quantity']);
        } else {
            StoreCart::create([
                'tenant_id'        => $store->tenant_id,
                'session_key'      => $sessionKey,
                'store_product_id' => $product->id,
                'quantity'         => $data['quantity'],
            ]);
        }

        return back()->with('success', 'Item added to cart.');
    }

    public function update(Request $request, string $slug, StoreCart $cartItem): RedirectResponse
    {
        $data = $request->validate([
            'quantity' => 'required|integer|min:0',
        ]);

        if ($data['quantity'] === 0) {
            $cartItem->delete();
        } else {
            $cartItem->update(['quantity' => $data['quantity']]);
        }

        return back()->with('success', 'Cart updated.');
    }

    public function remove(string $slug, StoreCart $cartItem): RedirectResponse
    {
        $cartItem->delete();

        return back()->with('success', 'Item removed from cart.');
    }

    public function clear(Request $request, string $slug): RedirectResponse
    {
        $sessionKey = $this->getSessionKey($request);
        StoreCart::where('session_key', $sessionKey)->delete();

        return back()->with('success', 'Cart cleared.');
    }
}
