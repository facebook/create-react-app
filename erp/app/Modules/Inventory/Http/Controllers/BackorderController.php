<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\Backorder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BackorderController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Backorder::class);

        $backorders = Backorder::latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Inventory/Backorders/Index', [
            'backorders' => $backorders,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Backorder::class);

        $validated = $request->validate([
            'product_id'       => 'required|exists:products,id',
            'warehouse_id'     => 'required|exists:warehouses,id',
            'customer_id'      => 'nullable|exists:contacts,id',
            'quantity_ordered'  => 'required|numeric|min:0.01',
            'expected_date'    => 'nullable|date',
            'notes'            => 'nullable|string',
        ]);

        $backorder = Backorder::create([
            'tenant_id' => auth()->user()->tenant_id,
            ...$validated,
        ]);

        return redirect()->route('inventory.backorders.show', $backorder);
    }

    public function show(Backorder $backorder): Response
    {
        $this->authorize('view', $backorder);

        return Inertia::render('Inventory/Backorders/Show', [
            'backorder' => $backorder,
        ]);
    }

    public function fulfill(Request $request, Backorder $backorder): RedirectResponse
    {
        $this->authorize('update', $backorder);

        $validated = $request->validate([
            'quantity' => 'required|numeric|min:0.01',
        ]);

        $backorder->fulfill((float) $validated['quantity']);

        return back()->with('success', 'Backorder fulfilled.');
    }

    public function cancel(Backorder $backorder): RedirectResponse
    {
        $this->authorize('update', $backorder);

        $backorder->cancel();

        return back()->with('success', 'Backorder cancelled.');
    }

    public function destroy(Backorder $backorder): RedirectResponse
    {
        $this->authorize('delete', $backorder);

        $backorder->delete();

        return redirect()->route('inventory.backorders.index');
    }
}
