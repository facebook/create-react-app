<?php

namespace App\Modules\Rental\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Rental\Models\RentalAgreement;
use App\Modules\Rental\Models\RentalItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RentalController extends Controller
{
    public function index(Request $request): Response
    {
        $query = RentalItem::query();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $items = $query->orderBy('name')->paginate(20)->withQueryString();

        return Inertia::render('Rental/Index', [
            'items'   => $items,
            'filters' => $request->only(['status', 'category']),
        ]);
    }

    public function show(RentalItem $item): Response
    {
        $item->load([
            'agreements' => fn ($q) => $q->latest()->limit(10),
        ]);

        return Inertia::render('Rental/Show', [
            'item' => $item,
        ]);
    }

    public function store(Request $request): RedirectResponse|\Symfony\Component\HttpFoundation\Response
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'description'   => 'nullable|string',
            'category'      => 'nullable|string|max:100',
            'daily_rate'    => 'required|numeric|min:0',
            'serial_number' => 'nullable|string|max:100',
            'status'        => 'nullable|in:available,rented,maintenance',
        ]);

        $item = RentalItem::create($validated);

        if ($request->wantsJson()) {
            return response()->json($item, 201);
        }

        return redirect()->route('rental.items.show', $item)->with('success', 'Rental item created.');
    }

    public function update(Request $request, RentalItem $item): RedirectResponse|\Symfony\Component\HttpFoundation\Response
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'description'   => 'nullable|string',
            'category'      => 'nullable|string|max:100',
            'daily_rate'    => 'required|numeric|min:0',
            'serial_number' => 'nullable|string|max:100',
            'status'        => 'nullable|in:available,rented,maintenance',
        ]);

        $item->update($validated);

        if ($request->wantsJson()) {
            return response()->json($item);
        }

        return redirect()->route('rental.items.show', $item)->with('success', 'Rental item updated.');
    }

    public function destroy(RentalItem $item): RedirectResponse|\Symfony\Component\HttpFoundation\Response
    {
        if (! $item->isAvailable()) {
            if (request()->wantsJson()) {
                return response()->json(['message' => 'Cannot delete an item that is currently rented or under maintenance.'], 422);
            }
            return redirect()->back()->with('error', 'Cannot delete an item that is currently rented or under maintenance.');
        }

        $hasActiveAgreement = $item->agreements()->where('status', 'active')->exists();
        if ($hasActiveAgreement) {
            if (request()->wantsJson()) {
                return response()->json(['message' => 'Cannot delete an item with an active rental agreement.'], 422);
            }
            return redirect()->back()->with('error', 'Cannot delete an item with an active rental agreement.');
        }

        $item->delete();

        if (request()->wantsJson()) {
            return response()->json(null, 204);
        }

        return redirect()->route('rental.items.index')->with('success', 'Rental item deleted.');
    }

    public function rent(Request $request, RentalItem $item): RedirectResponse|\Symfony\Component\HttpFoundation\Response
    {
        if (! $item->isAvailable()) {
            if ($request->wantsJson()) {
                return response()->json(['message' => 'Item is not available for rent.'], 422);
            }
            return redirect()->back()->with('error', 'Item is not available for rent.')->withErrors(['item' => 'Item is not available for rent.']);
        }

        $validated = $request->validate([
            'customer_name'  => 'required|string|max:255',
            'customer_email' => 'nullable|email|max:255',
            'start_date'     => 'required|date',
            'end_date'       => 'nullable|date|after_or_equal:start_date',
            'daily_rate'     => 'nullable|numeric|min:0',
            'deposit'        => 'nullable|numeric|min:0',
            'notes'          => 'nullable|string',
        ]);

        $agreement = RentalAgreement::create([
            'rental_item_id' => $item->id,
            'customer_name'  => $validated['customer_name'],
            'customer_email' => $validated['customer_email'] ?? null,
            'start_date'     => $validated['start_date'],
            'end_date'       => $validated['end_date'] ?? null,
            'daily_rate'     => $validated['daily_rate'] ?? $item->daily_rate,
            'deposit'        => $validated['deposit'] ?? 0,
            'notes'          => $validated['notes'] ?? null,
            'status'         => 'active',
        ]);

        $item->update(['status' => 'rented']);

        if ($request->wantsJson()) {
            return response()->json($agreement->load('item'), 201);
        }

        return redirect()->route('rental.items.show', $item)->with('success', 'Item rented successfully.');
    }

    public function returnItem(Request $request, RentalItem $item): RedirectResponse|\Symfony\Component\HttpFoundation\Response
    {
        $agreement = $item->agreements()->where('status', 'active')->latest()->first();

        if (! $agreement) {
            if ($request->wantsJson()) {
                return response()->json(['message' => 'No active rental agreement found for this item.'], 422);
            }
            return redirect()->back()->with('error', 'No active rental agreement found for this item.');
        }

        $agreement->return();

        if ($request->wantsJson()) {
            return response()->json($agreement->fresh());
        }

        return redirect()->route('rental.items.show', $item)->with('success', 'Item returned successfully.');
    }

    public function calendar(Request $request): Response
    {
        $items = RentalItem::with([
            'agreements' => fn ($q) => $q->whereIn('status', ['active', 'overdue'])
                ->orderBy('start_date'),
        ])->orderBy('name')->get();

        return Inertia::render('Rental/Calendar', [
            'items' => $items,
        ]);
    }

    public function agreements(Request $request): Response
    {
        $query = RentalAgreement::with('item');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $agreements = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Rental/Agreements', [
            'agreements' => $agreements,
            'filters'    => $request->only(['status']),
        ]);
    }
}
