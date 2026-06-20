<?php

namespace App\Modules\Ecommerce\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Ecommerce\Models\StoreCoupon;
use App\Modules\Ecommerce\Models\StoreSettings;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CouponController extends Controller
{
    public function index(Request $request): Response
    {
        $tenantId = auth()->user()->tenant_id;

        $coupons = StoreCoupon::where('tenant_id', $tenantId)
            ->orderByDesc('created_at')
            ->paginate(20);

        return Inertia::render('Ecommerce/Coupons/Index', [
            'coupons' => $coupons,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $tenantId = auth()->user()->tenant_id;

        $data = $request->validate([
            'code'             => ['required', 'string', 'max:50',
                \Illuminate\Validation\Rule::unique('store_coupons')->where(fn ($q) => $q->where('tenant_id', $tenantId))->whereNull('deleted_at'),
            ],
            'type'             => 'required|in:fixed,percentage',
            'value'            => 'required|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_uses'         => 'nullable|integer|min:1',
            'valid_from'       => 'nullable|date',
            'valid_until'      => 'nullable|date|after_or_equal:valid_from',
            'is_active'        => 'boolean',
        ]);

        StoreCoupon::create(array_merge($data, ['tenant_id' => $tenantId]));

        return back()->with('success', 'Coupon created.');
    }

    public function destroy(StoreCoupon $coupon): RedirectResponse
    {
        $coupon->delete();

        return back()->with('success', 'Coupon deleted.');
    }

    public function validate(Request $request, string $slug): JsonResponse
    {
        $store = StoreSettings::where('store_slug', $slug)->where('is_active', true)->firstOrFail();

        $data = $request->validate([
            'code'     => 'required|string',
            'subtotal' => 'nullable|numeric|min:0',
        ]);

        $coupon = StoreCoupon::where('tenant_id', $store->tenant_id)
            ->where('code', strtoupper($data['code']))
            ->first();

        if (! $coupon) {
            $coupon = StoreCoupon::where('tenant_id', $store->tenant_id)
                ->where('code', $data['code'])
                ->first();
        }

        if (! $coupon || ! $coupon->isValid()) {
            return response()->json([
                'valid'           => false,
                'discount_amount' => 0,
                'message'         => 'Invalid or expired coupon code.',
            ]);
        }

        $subtotal = (float) ($data['subtotal'] ?? 0);

        if ($subtotal < $coupon->min_order_amount) {
            return response()->json([
                'valid'           => false,
                'discount_amount' => 0,
                'message'         => 'Order does not meet minimum amount for this coupon.',
            ]);
        }

        $discount = $coupon->applyTo($subtotal);

        return response()->json([
            'valid'           => true,
            'discount_amount' => $discount,
            'message'         => 'Coupon applied successfully.',
        ]);
    }
}
