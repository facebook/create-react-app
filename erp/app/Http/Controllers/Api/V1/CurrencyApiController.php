<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Finance\Models\Currency;
use App\Modules\Finance\Services\CurrencyConversionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CurrencyApiController extends ApiController {
    public function index(): JsonResponse {
        $tenantId  = auth()->user()->tenant_id;
        $currencies = Currency::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderBy('code')
            ->get();
        return $this->success($currencies);
    }

    public function convert(Request $request): JsonResponse {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'from'   => 'required|string|size:3',
            'to'     => 'required|string|size:3',
            'date'   => 'nullable|date',
        ]);

        $tenantId = auth()->user()->tenant_id;
        $service  = new CurrencyConversionService($tenantId);
        $date     = isset($validated['date']) ? \Carbon\Carbon::parse($validated['date']) : null;
        $result   = $service->convert((float) $validated['amount'], $validated['from'], $validated['to'], $date);
        $rate     = $service->getRate($validated['from'], $validated['to'], $date);

        return $this->success([
            'from'   => $validated['from'],
            'to'     => $validated['to'],
            'amount' => $validated['amount'],
            'result' => $result,
            'rate'   => $rate,
        ]);
    }
}
