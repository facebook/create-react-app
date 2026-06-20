<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\CustomerDiscount;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerDiscountController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', CustomerDiscount::class);

        $discounts = CustomerDiscount::latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Inventory/CustomerDiscounts/Index', [
            'discounts' => $discounts,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', CustomerDiscount::class);

        $validated = $request->validate([
            'discount_type'  => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
            'applies_to'     => 'nullable|in:all,category,product',
            'applies_to_id'  => 'nullable|integer',
            'valid_from'     => 'nullable|date',
            'valid_to'       => 'nullable|date',
            'customer_id'    => 'nullable|integer',
        ]);

        $validated['tenant_id']  = app('tenant')->id;
        $validated['applies_to'] = $validated['applies_to'] ?? 'all';

        CustomerDiscount::create($validated);

        return back();
    }

    public function destroy(CustomerDiscount $customerDiscount): RedirectResponse
    {
        $this->authorize('delete', $customerDiscount);

        $customerDiscount->delete();

        return back();
    }
}
