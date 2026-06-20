<?php

namespace App\Modules\Ecommerce\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Ecommerce\Models\StoreProduct;
use App\Modules\Ecommerce\Models\StoreReview;
use App\Modules\Ecommerce\Models\StoreSettings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    public function store(Request $request, string $slug, StoreProduct $storeProduct): RedirectResponse
    {
        $store = StoreSettings::where('store_slug', $slug)->where('is_active', true)->firstOrFail();

        $data = $request->validate([
            'reviewer_name'  => 'required|string|max:255',
            'reviewer_email' => 'nullable|email|max:255',
            'rating'         => 'required|integer|min:1|max:5',
            'title'          => 'nullable|string|max:255',
            'body'           => 'nullable|string',
        ]);

        StoreReview::create(array_merge($data, [
            'tenant_id'        => $store->tenant_id,
            'store_product_id' => $storeProduct->id,
            'is_approved'      => false,
        ]));

        return back()->with('success', 'Review submitted. It will appear once approved.');
    }

    public function index(Request $request): Response
    {
        $tenantId = auth()->user()->tenant_id;

        $reviews = StoreReview::with('product.product')
            ->where('tenant_id', $tenantId)
            ->when($request->filled('rating'), fn ($q) => $q->where('rating', $request->rating))
            ->when($request->filled('is_approved'), fn ($q) => $q->where('is_approved', $request->boolean('is_approved')))
            ->orderByDesc('created_at')
            ->paginate(20)
            ->through(fn ($r) => [
                'id'            => $r->id,
                'reviewer_name' => $r->reviewer_name,
                'rating'        => $r->rating,
                'title'         => $r->title,
                'body'          => $r->body,
                'is_approved'   => $r->is_approved,
                'created_at'    => $r->created_at,
                'product'       => $r->product ? [
                    'id'   => $r->product->id,
                    'name' => $r->product->product?->name ?? 'Product',
                ] : null,
            ]);

        return Inertia::render('Ecommerce/Reviews/Index', [
            'reviews' => $reviews,
            'filters' => $request->only(['rating', 'is_approved']),
        ]);
    }

    public function approve(StoreReview $review): RedirectResponse
    {
        $review->approve();

        return back()->with('success', 'Review approved.');
    }

    public function destroy(StoreReview $review): RedirectResponse
    {
        $review->delete();

        return back()->with('success', 'Review deleted.');
    }
}
