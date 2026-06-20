<?php

namespace App\Modules\Finance\Services;

use App\Modules\Finance\Models\Currency;
use App\Modules\Finance\Models\ExchangeRate;

class CurrencyConversionService {
    public function __construct(private int $tenantId) {}

    public function getBaseCurrency(): ?Currency {
        return Currency::getBase($this->tenantId);
    }

    public function convert(float $amount, string $from, string $to, ?\Carbon\Carbon $date = null): ?float {
        return ExchangeRate::convert($this->tenantId, $amount, $from, $to, $date);
    }

    public function convertToBase(float $amount, string $from, ?\Carbon\Carbon $date = null): ?float {
        $base = $this->getBaseCurrency();
        if (!$base || $base->code === $from) return $amount;
        return $this->convert($amount, $from, $base->code, $date);
    }

    public function getRate(string $from, string $to, ?\Carbon\Carbon $date = null): ?float {
        return ExchangeRate::getRate($this->tenantId, $from, $to, $date);
    }

    public function getSupportedCurrencies(): \Illuminate\Support\Collection {
        return Currency::withoutGlobalScopes()
            ->where('tenant_id', $this->tenantId)
            ->where('is_active', true)
            ->orderBy('code')
            ->get();
    }
}
