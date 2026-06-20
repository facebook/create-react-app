<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\StockReservation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StockReservationController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', StockReservation::class);

        $reservations = StockReservation::latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Inventory/StockReservations/Index', [
            'reservations' => $reservations,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', StockReservation::class);

        return Inertia::render('Inventory/StockReservations/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', StockReservation::class);

        $validated = $request->validate([
            'product_id'     => 'required|exists:products,id',
            'quantity'       => 'required|numeric|min:0.01',
            'reserved_until' => 'nullable|date',
            'reference_type' => 'nullable|string',
            'reference_id'   => 'nullable|string',
            'notes'          => 'nullable|string',
        ]);

        $reservation = StockReservation::create([
            'tenant_id'   => app('tenant')->id,
            'reserved_by' => auth()->id(),
            ...$validated,
        ]);

        $reservation->reservation_number = $reservation->generateReservationNumber();
        $reservation->save();

        return redirect()->route('inventory.stock-reservations.index');
    }

    public function show(StockReservation $stockReservation): Response
    {
        $this->authorize('view', $stockReservation);

        return Inertia::render('Inventory/StockReservations/Show', [
            'reservation' => $stockReservation,
        ]);
    }

    public function edit(StockReservation $stockReservation): Response
    {
        $this->authorize('update', $stockReservation);

        return Inertia::render('Inventory/StockReservations/Edit', [
            'reservation' => $stockReservation,
        ]);
    }

    public function update(Request $request, StockReservation $stockReservation): RedirectResponse
    {
        $this->authorize('update', $stockReservation);

        $validated = $request->validate([
            'product_id'     => 'sometimes|exists:products,id',
            'quantity'       => 'sometimes|numeric|min:0.01',
            'reserved_until' => 'nullable|date',
            'reference_type' => 'nullable|string',
            'reference_id'   => 'nullable|string',
            'notes'          => 'nullable|string',
        ]);

        $stockReservation->update($validated);

        return redirect()->route('inventory.stock-reservations.index');
    }

    public function destroy(StockReservation $stockReservation): RedirectResponse
    {
        $this->authorize('delete', $stockReservation);

        $stockReservation->delete();

        return redirect()->route('inventory.stock-reservations.index');
    }

    public function fulfill(Request $request, StockReservation $stockReservation): RedirectResponse
    {
        $this->authorize('fulfill', $stockReservation);

        $validated = $request->validate([
            'quantity' => 'required|numeric|min:0.01',
        ]);

        $stockReservation->fulfill((float) $validated['quantity']);

        return redirect()->route('inventory.stock-reservations.index');
    }

    public function cancel(StockReservation $stockReservation): RedirectResponse
    {
        $this->authorize('cancel', $stockReservation);

        $stockReservation->cancel();

        return redirect()->route('inventory.stock-reservations.index');
    }

    public function expire(StockReservation $stockReservation): RedirectResponse
    {
        $this->authorize('expire', $stockReservation);

        $stockReservation->expire();

        return redirect()->route('inventory.stock-reservations.index');
    }
}
