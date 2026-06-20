<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\VendorBill;
use App\Modules\Finance\Models\VendorBillItem;
use App\Modules\Inventory\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VendorBillController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', VendorBill::class);

        $query = VendorBill::with(['supplier']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $bills = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Finance/VendorBills/Index', [
            'bills'   => $bills,
            'filters' => $request->only('status'),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', VendorBill::class);

        $suppliers = Supplier::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Finance/VendorBills/Create', [
            'suppliers' => $suppliers,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', VendorBill::class);

        $data = $request->validate([
            'supplier_id'          => 'nullable|exists:suppliers,id',
            'bill_date'            => 'required|date',
            'due_date'             => 'nullable|date',
            'currency'             => 'nullable|string|max:3',
            'notes'                => 'nullable|string',
            'items'                => 'required|array|min:1',
            'items.*.description'  => 'required|string|max:255',
            'items.*.quantity'     => 'required|numeric|min:0.01',
            'items.*.unit_price'   => 'required|numeric|min:0',
        ]);

        $tenantId = app('tenant')->id;

        $bill = VendorBill::create([
            'tenant_id'   => $tenantId,
            'bill_number' => VendorBill::generateBillNumber(),
            'supplier_id' => $data['supplier_id'] ?? null,
            'bill_date'   => $data['bill_date'],
            'due_date'    => $data['due_date'] ?? null,
            'currency'    => $data['currency'] ?? 'USD',
            'notes'       => $data['notes'] ?? null,
            'status'      => 'draft',
            'subtotal'    => 0,
            'tax'         => 0,
            'total'       => 0,
            'created_by'  => auth()->id(),
        ]);

        foreach ($data['items'] as $item) {
            VendorBillItem::create([
                'tenant_id'      => $tenantId,
                'vendor_bill_id' => $bill->id,
                'product_id'     => $item['product_id'] ?? null,
                'description'    => $item['description'],
                'quantity'       => $item['quantity'],
                'unit_price'     => $item['unit_price'],
            ]);
        }

        $bill->recalculateTotals();

        return redirect()->route('finance.vendor-bills.show', $bill);
    }

    public function show(VendorBill $vendorBill): Response
    {
        $this->authorize('view', $vendorBill);

        $vendorBill->load(['supplier', 'items']);

        return Inertia::render('Finance/VendorBills/Show', [
            'bill' => $vendorBill,
        ]);
    }

    public function submit(VendorBill $vendorBill): RedirectResponse
    {
        $this->authorize('update', $vendorBill);

        $vendorBill->submit();

        return back()->with('success', 'Bill submitted.');
    }

    public function approve(VendorBill $vendorBill): RedirectResponse
    {
        $this->authorize('update', $vendorBill);

        $vendorBill->approve(auth()->id());

        return back()->with('success', 'Bill approved.');
    }

    public function pay(VendorBill $vendorBill): RedirectResponse
    {
        $this->authorize('update', $vendorBill);

        $vendorBill->pay();

        return back()->with('success', 'Bill marked as paid.');
    }

    public function cancel(VendorBill $vendorBill): RedirectResponse
    {
        $this->authorize('update', $vendorBill);

        $vendorBill->cancel();

        return back()->with('success', 'Bill cancelled.');
    }

    public function destroy(VendorBill $vendorBill): RedirectResponse
    {
        $this->authorize('delete', $vendorBill);

        $vendorBill->delete();

        return redirect()->route('finance.vendor-bills.index');
    }
}
