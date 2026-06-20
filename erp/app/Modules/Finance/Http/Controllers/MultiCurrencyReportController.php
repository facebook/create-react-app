<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\Currency;
use App\Modules\Finance\Models\ExchangeRate;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Services\CurrencyConversionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MultiCurrencyReportController extends Controller {
    public function index(Request $request): \Inertia\Response {
        $tenantId  = app('tenant')->id;
        $service   = new CurrencyConversionService($tenantId);
        $base      = $service->getBaseCurrency();
        $currencies = $service->getSupportedCurrencies();

        // Gather invoice totals per currency; `total` is a computed accessor so we load items
        $invoiceSummary = Invoice::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->where('status', 'paid')
            ->with('items')
            ->get()
            ->groupBy('currency_code')
            ->map(function ($invoices, $currencyCode) use ($service) {
                $totalAmount = $invoices->sum(fn ($inv) => $inv->total);
                $converted   = $service->convertToBase((float) $totalAmount, (string) $currencyCode);
                return [
                    'currency_code' => $currencyCode,
                    'total_amount'  => $totalAmount,
                    'count'         => $invoices->count(),
                    'base_amount'   => $converted,
                ];
            })
            ->values();

        // Recent exchange rates
        $recentRates = ExchangeRate::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->orderByDesc('effective_date')
            ->limit(20)
            ->get(['from_currency', 'to_currency', 'base_currency', 'quote_currency', 'rate', 'effective_date']);

        return Inertia::render('Finance/MultiCurrency/ConsolidationReport', [
            'baseCurrency'   => $base,
            'currencies'     => $currencies,
            'invoiceSummary' => $invoiceSummary,
            'recentRates'    => $recentRates,
        ]);
    }

    public function convertPreview(Request $request): \Illuminate\Http\JsonResponse {
        $validated = $request->validate([
            'amount'   => 'required|numeric|min:0',
            'from'     => 'required|string|size:3',
            'to'       => 'required|string|size:3',
            'date'     => 'nullable|date',
        ]);

        $tenantId = app('tenant')->id;
        $service  = new CurrencyConversionService($tenantId);
        $rawDate  = $validated['date'] ?? null;
        $date     = $rawDate ? \Carbon\Carbon::parse($rawDate) : null;

        $result = $service->convert((float) $validated['amount'], $validated['from'], $validated['to'], $date);
        $rate   = $service->getRate($validated['from'], $validated['to'], $date);

        return response()->json([
            'from'   => $validated['from'],
            'to'     => $validated['to'],
            'amount' => $validated['amount'],
            'result' => $result,
            'rate'   => $rate,
            'date'   => $rawDate ?? now()->toDateString(),
        ]);
    }
}
