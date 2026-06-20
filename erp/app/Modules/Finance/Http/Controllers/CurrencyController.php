<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\Currency;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CurrencyController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', Currency::class);

        $currencies = Currency::withoutGlobalScopes()
            ->where('tenant_id', app('tenant')->id)
            ->orderBy('code')
            ->get();

        return Inertia::render('Finance/Currencies/Index', [
            'currencies' => $currencies,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Currency::class);

        return Inertia::render('Finance/Currencies/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Currency::class);

        $validated = $request->validate([
            'code'           => ['required', 'string', 'size:3', 'regex:/^[A-Z]{3}$/'],
            'name'           => ['required', 'string', 'max:100'],
            'symbol'         => ['required', 'string', 'max:10'],
            'decimal_places' => ['sometimes', 'integer', 'min:0', 'max:4'],
            'rounding'       => ['sometimes', 'numeric', 'min:0'],
            'is_base'        => ['sometimes', 'boolean'],
            'is_active'      => ['sometimes', 'boolean'],
        ]);

        $tenantId             = app('tenant')->id;
        $validated['tenant_id'] = $tenantId;
        $validated['code']    = strtoupper($validated['code']);

        $isBase = $validated['is_base'] ?? false;
        unset($validated['is_base']);

        $currency = Currency::create($validated);

        if ($isBase) {
            $currency->setAsBase();
        }

        return redirect()->route('finance.currencies.index')->with('success', 'Currency created.');
    }

    public function edit(Currency $currency): Response
    {
        $this->authorize('update', $currency);

        return Inertia::render('Finance/Currencies/Edit', [
            'currency' => $currency,
        ]);
    }

    public function update(Request $request, Currency $currency): RedirectResponse
    {
        $this->authorize('update', $currency);

        $validated = $request->validate([
            'code'           => ['required', 'string', 'size:3', 'regex:/^[A-Z]{3}$/'],
            'name'           => ['required', 'string', 'max:100'],
            'symbol'         => ['required', 'string', 'max:10'],
            'decimal_places' => ['sometimes', 'integer', 'min:0', 'max:4'],
            'rounding'       => ['sometimes', 'numeric', 'min:0'],
            'is_base'        => ['sometimes', 'boolean'],
            'is_active'      => ['sometimes', 'boolean'],
        ]);

        $isBase = $validated['is_base'] ?? false;
        unset($validated['is_base']);

        $currency->update($validated);

        if ($isBase) {
            $currency->setAsBase();
        }

        return redirect()->route('finance.currencies.index')->with('success', 'Currency updated.');
    }

    public function destroy(Currency $currency): RedirectResponse
    {
        $this->authorize('delete', $currency);

        if ($currency->is_base) {
            abort(422, 'Cannot delete the base currency.');
        }

        $currency->delete();

        return redirect()->route('finance.currencies.index')->with('success', 'Currency deleted.');
    }

    public function setBase(Request $request, Currency $currency): RedirectResponse
    {
        $this->authorize('update', $currency);

        $currency->setAsBase();

        return redirect()->route('finance.currencies.index')->with('success', 'Base currency updated.');
    }
}
