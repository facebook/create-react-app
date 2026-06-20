<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\Supplier;
use App\Modules\Inventory\Models\SupplierReview;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupplierReviewController extends Controller
{
    public function index(Request $request): Response
    {
        $reviews = SupplierReview::with(['supplier', 'reviewedBy'])
            ->when($request->supplier_id, fn ($q) => $q->where('supplier_id', $request->supplier_id))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Inventory/SupplierReviews/Index', [
            'reviews'   => $reviews,
            'suppliers' => Supplier::orderBy('name')->get(['id', 'name']),
            'filters'   => $request->only(['supplier_id']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'supplier_id'          => 'required|exists:suppliers,id',
            'review_date'          => 'required|date',
            'quality_score'        => 'required|integer|min:1|max:5',
            'delivery_score'       => 'required|integer|min:1|max:5',
            'communication_score'  => 'required|integer|min:1|max:5',
            'price_score'          => 'required|integer|min:1|max:5',
            'notes'                => 'nullable|string',
            'purchase_order_id'    => 'nullable|integer',
        ]);

        $validated['reviewed_by'] = auth()->id();
        $validated['tenant_id']   = auth()->user()->tenant_id;

        SupplierReview::create($validated);

        return back()->with('success', 'Review added successfully.');
    }

    public function destroy(SupplierReview $supplierReview): RedirectResponse
    {
        $this->authorize('delete', $supplierReview);
        $supplierReview->delete();

        return back()->with('success', 'Review deleted.');
    }
}
