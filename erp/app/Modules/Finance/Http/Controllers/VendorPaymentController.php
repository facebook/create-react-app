<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\VendorPayment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VendorPaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', VendorPayment::class);

        $query = VendorPayment::orderByDesc('payment_date');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $vendorPayments = $query->paginate(20);

        return Inertia::render('Finance/VendorPayments/Index', compact('vendorPayments'));
    }

    public function create(): Response
    {
        $this->authorize('create', VendorPayment::class);

        return Inertia::render('Finance/VendorPayments/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', VendorPayment::class);

        $data = $request->validate([
            'vendor_name'    => 'required|string|max:255',
            'vendor_code'    => 'nullable|string|max:255',
            'amount'         => 'required|numeric|min:0',
            'currency'       => 'nullable|string|max:3',
            'payment_method' => 'nullable|in:bank_transfer,cheque,cash,online',
            'reference'      => 'nullable|string|max:255',
            'payment_date'   => 'required|date',
            'due_date'       => 'nullable|date',
            'notes'          => 'nullable|string',
        ]);

        VendorPayment::create([
            'tenant_id'      => app('tenant')->id,
            'vendor_name'    => $data['vendor_name'],
            'vendor_code'    => $data['vendor_code'] ?? null,
            'amount'         => $data['amount'],
            'currency'       => $data['currency'] ?? 'USD',
            'payment_method' => $data['payment_method'] ?? 'bank_transfer',
            'reference'      => $data['reference'] ?? null,
            'payment_date'   => $data['payment_date'],
            'due_date'       => $data['due_date'] ?? null,
            'notes'          => $data['notes'] ?? null,
            'created_by'     => auth()->id(),
        ]);

        return redirect()->route('finance.vendor-payments.index')
            ->with('success', 'Vendor payment created.');
    }

    public function show(VendorPayment $vendorPayment): Response
    {
        $this->authorize('view', $vendorPayment);

        $vendorPayment->load(['approvedBy', 'createdBy']);

        return Inertia::render('Finance/VendorPayments/Show', compact('vendorPayment'));
    }

    public function edit(VendorPayment $vendorPayment): Response
    {
        $this->authorize('update', $vendorPayment);

        return Inertia::render('Finance/VendorPayments/Edit', compact('vendorPayment'));
    }

    public function update(Request $request, VendorPayment $vendorPayment): RedirectResponse
    {
        $this->authorize('update', $vendorPayment);

        $data = $request->validate([
            'vendor_name'    => 'required|string|max:255',
            'vendor_code'    => 'nullable|string|max:255',
            'amount'         => 'required|numeric|min:0',
            'currency'       => 'nullable|string|max:3',
            'payment_method' => 'nullable|in:bank_transfer,cheque,cash,online',
            'reference'      => 'nullable|string|max:255',
            'payment_date'   => 'required|date',
            'due_date'       => 'nullable|date',
            'notes'          => 'nullable|string',
        ]);

        $vendorPayment->update($data);

        return redirect()->route('finance.vendor-payments.index')
            ->with('success', 'Vendor payment updated.');
    }

    public function destroy(VendorPayment $vendorPayment): RedirectResponse
    {
        $this->authorize('delete', $vendorPayment);

        $vendorPayment->delete();

        return redirect()->route('finance.vendor-payments.index')
            ->with('success', 'Vendor payment deleted.');
    }

    // ── Custom actions ────────────────────────────────────────────────────────

    public function approve(VendorPayment $vendorPayment): RedirectResponse
    {
        $this->authorize('approve', $vendorPayment);

        $vendorPayment->approve(auth()->id());

        return redirect()->route('finance.vendor-payments.index')
            ->with('success', 'Vendor payment approved.');
    }

    public function process(VendorPayment $vendorPayment): RedirectResponse
    {
        $this->authorize('process', $vendorPayment);

        $vendorPayment->process();

        return redirect()->route('finance.vendor-payments.index')
            ->with('success', 'Vendor payment processed.');
    }

    public function reject(VendorPayment $vendorPayment): RedirectResponse
    {
        $this->authorize('reject', $vendorPayment);

        $vendorPayment->reject();

        return redirect()->route('finance.vendor-payments.index')
            ->with('success', 'Vendor payment rejected.');
    }

    public function cancel(VendorPayment $vendorPayment): RedirectResponse
    {
        $this->authorize('cancel', $vendorPayment);

        $vendorPayment->cancel();

        return redirect()->route('finance.vendor-payments.index')
            ->with('success', 'Vendor payment cancelled.');
    }
}
