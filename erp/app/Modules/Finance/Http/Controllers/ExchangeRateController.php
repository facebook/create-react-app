<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\Currency;
use App\Modules\Finance\Models\ExchangeRate;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ExchangeRateController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', ExchangeRate::class);

        $tenantId = app('tenant')->id;

        $query = ExchangeRate::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->orderByDesc('effective_date')
            ->orderBy('base_currency')
            ->orderBy('quote_currency');

        if ($request->filled('from_currency')) {
            $from = $request->input('from_currency');
            $query->where(function ($q) use ($from) {
                $q->where('from_currency', $from)
                  ->orWhere(function ($q2) use ($from) {
                      $q2->whereNull('from_currency')->where('base_currency', $from);
                  });
            });
        }

        $rates = $query->paginate(20);

        $currencies = Currency::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->active()
            ->orderBy('code')
            ->get();

        return Inertia::render('Finance/ExchangeRates/Index', [
            'rates'      => $rates,
            'currencies' => $currencies,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', ExchangeRate::class);

        return Inertia::render('Finance/ExchangeRates/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', ExchangeRate::class);

        $tenantId = app('tenant')->id;

        $validated = $request->validate([
            'from_currency'  => ['sometimes', 'nullable', 'string', 'size:3'],
            'to_currency'    => ['sometimes', 'nullable', 'string', 'size:3'],
            'base_currency'  => ['required_without:from_currency', 'nullable', 'string', 'size:3'],
            'quote_currency' => ['required_without:to_currency', 'nullable', 'string', 'size:3', 'different:base_currency'],
            'rate'           => ['required', 'numeric', 'min:0.000001'],
            'effective_date' => [
                'required',
                'date',
                Rule::unique('exchange_rates')->where(fn ($q) => $q
                    ->where('base_currency', $request->input('base_currency') ?? $request->input('from_currency'))
                    ->where('quote_currency', $request->input('quote_currency') ?? $request->input('to_currency'))
                    ->where('tenant_id', $tenantId)
                    ->whereDate('effective_date', $request->input('effective_date'))
                ),
            ],
            'source' => ['nullable', 'string', 'max:100'],
        ]);

        ExchangeRate::create(array_merge($validated, ['tenant_id' => $tenantId]));

        return redirect()->back()->with('success', 'Exchange rate created.');
    }

    public function destroy(ExchangeRate $exchangeRate): RedirectResponse
    {
        $this->authorize('delete', $exchangeRate);

        $exchangeRate->delete();

        return redirect()->back()->with('success', 'Exchange rate deleted.');
    }

    public function convert(Request $request): Response
    {
        $this->authorize('viewAny', ExchangeRate::class);

        $tenantId = app('tenant')->id;

        $validated = $request->validate([
            'amount' => ['nullable', 'numeric', 'min:0'],
            'from'   => ['nullable', 'string', 'size:3'],
            'to'     => ['nullable', 'string', 'size:3'],
            'date'   => ['nullable', 'date'],
        ]);

        $result = null;
        $rate   = null;

        if (!empty($validated['amount']) && !empty($validated['from']) && !empty($validated['to'])) {
            $date = !empty($validated['date']) ? Carbon::parse($validated['date']) : null;
            $rate = ExchangeRate::getRate($tenantId, $validated['from'], $validated['to'], $date);
            if ($rate !== null) {
                $result = ExchangeRate::convert($tenantId, (float) $validated['amount'], $validated['from'], $validated['to'], $date);
            }
        }

        $currencies = Currency::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->active()
            ->orderBy('code')
            ->get();

        return Inertia::render('Finance/ExchangeRates/Convert', [
            'currencies' => $currencies,
            'result'     => $result,
            'rate'       => $rate,
            'input'      => $validated,
        ]);
    }

    public function report(Request $request): Response
    {
        $this->authorize('viewAny', ExchangeRate::class);

        $tenantId = $request->user()->tenant_id;
        $today    = now()->toDateString();
        $ago30    = now()->subDays(30)->toDateString();

        // Get all unique currency pairs for this tenant
        $pairs = ExchangeRate::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->select('base_currency', 'quote_currency')
            ->distinct()
            ->get();

        $rows = [];
        foreach ($pairs as $pair) {
            $currentRate = ExchangeRate::getRate($tenantId, $pair->base_currency, $pair->quote_currency, $today);
            $priorRate   = ExchangeRate::getRate($tenantId, $pair->base_currency, $pair->quote_currency, $ago30);

            $change = null;
            if ($priorRate !== null && $priorRate != 0 && $currentRate !== null) {
                $change = round((($currentRate - $priorRate) / $priorRate) * 100, 2);
            }

            $rows[] = [
                'pair'           => $pair->base_currency . '/' . $pair->quote_currency,
                'base_currency'  => $pair->base_currency,
                'quote_currency' => $pair->quote_currency,
                'current_rate'   => $currentRate,
                'prior_rate'     => $priorRate,
                'change_pct'     => $change,
            ];
        }

        return Inertia::render('Finance/ExchangeRates/Report', [
            'rows'  => $rows,
            'asOf'  => $today,
            'ago30' => $ago30,
        ]);
    }
}
