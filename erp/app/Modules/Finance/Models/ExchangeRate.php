<?php

namespace App\Modules\Finance\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class ExchangeRate extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'base_currency',
        'quote_currency',
        'from_currency',
        'to_currency',
        'rate',
        'effective_date',
        'is_active',
        'source',
    ];

    protected $casts = [
        'effective_date' => 'date',
        'rate'           => 'float',
        'is_active'      => 'boolean',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * When setting from_currency, also populate base_currency for backward compatibility.
     */
    public function setFromCurrencyAttribute(string $value): void
    {
        $this->attributes['from_currency']  = $value;
        $this->attributes['base_currency'] = $value;
    }

    /**
     * When setting to_currency, also populate quote_currency for backward compatibility.
     */
    public function setToCurrencyAttribute(string $value): void
    {
        $this->attributes['to_currency']    = $value;
        $this->attributes['quote_currency'] = $value;
    }

    /**
     * When setting base_currency, also populate from_currency.
     */
    public function setBaseCurrencyAttribute(string $value): void
    {
        $this->attributes['base_currency']  = $value;
        $this->attributes['from_currency'] = $value;
    }

    /**
     * When setting quote_currency, also populate to_currency.
     */
    public function setQuoteCurrencyAttribute(string $value): void
    {
        $this->attributes['quote_currency'] = $value;
        $this->attributes['to_currency']    = $value;
    }

    /**
     * Get the most recent rate on or before $date where from=from AND to=to.
     * Supports both from_currency/to_currency and base_currency/quote_currency columns.
     * Returns the rate as float, or null if not found.
     *
     * @param int         $tenantId
     * @param string      $from
     * @param string      $to
     * @param string|Carbon|null $date
     */
    public static function getRate(int $tenantId, string $from, string $to, $date = null): ?float
    {
        if ($from === $to) {
            return 1.0;
        }

        $dateStr = $date instanceof Carbon
            ? $date->toDateString()
            : ($date ?? now()->toDateString());

        $value = static::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->where(function ($q) use ($from, $to) {
                // Support new from_currency/to_currency columns
                $q->where(function ($q2) use ($from, $to) {
                    $q2->where('from_currency', $from)->where('to_currency', $to);
                })
                // Support old base_currency/quote_currency columns
                ->orWhere(function ($q2) use ($from, $to) {
                    $q2->whereNull('from_currency')
                       ->where('base_currency', $from)
                       ->where('quote_currency', $to);
                });
            })
            ->whereDate('effective_date', '<=', $dateStr)
            ->orderByDesc('effective_date')
            ->value('rate');

        return $value !== null ? (float) $value : null;
    }

    /**
     * Convert an amount from one currency to another.
     * Supports two call signatures:
     *   New: convert(int $tenantId, float $amount, string $from, string $to, ?Carbon $date = null)
     *   Old: convert(float $amount, string $from, string $to, int $tenantId, ?string $date = null)
     *
     * Returns null if no rate found.
     */
    public static function convert($tenantIdOrAmount, $amountOrFrom, string $from, $toOrTenantId, $dateOrNull = null): ?float
    {
        // Detect call signature:
        // New: first arg is int (tenantId), second arg is numeric (amount)
        // Old: first arg is float/int (amount), second arg is string (from currency)
        if (is_string($amountOrFrom)) {
            // Old signature: convert(amount, from, to, tenantId, date)
            $amount   = (float) $tenantIdOrAmount;
            $fromCurr = (string) $amountOrFrom;
            $toCurr   = (string) $from;
            $tenantId = (int) $toOrTenantId;
            $date     = $dateOrNull;
        } else {
            // New signature: convert(tenantId, amount, from, to, date)
            $tenantId = (int) $tenantIdOrAmount;
            $amount   = (float) $amountOrFrom;
            $fromCurr = (string) $from;
            $toCurr   = (string) $toOrTenantId;
            $date     = $dateOrNull;
        }

        if ($fromCurr === $toCurr) {
            return $amount;
        }

        $rate = static::getRate($tenantId, $fromCurr, $toCurr, $date);

        if ($rate === null) {
            return null;
        }

        return round($amount * $rate, 4);
    }

    /**
     * Legacy helper: get rate for a currency code vs USD.
     * Returns 1.0 if currency is USD or no rate found.
     */
    public static function rateFor(string $currencyCode, string $tenantIdOrDate, ?string $date = null): float
    {
        if ($currencyCode === 'USD') {
            return 1.0;
        }

        if ($date === null) {
            $date     = $tenantIdOrDate;
            $tenantId = app('tenant')->id;
        } else {
            $tenantId = (int) $tenantIdOrDate;
        }

        $record = static::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->where(function ($q) use ($currencyCode) {
                $q->where(function ($q2) use ($currencyCode) {
                    $q2->where('base_currency', 'USD')
                       ->where('quote_currency', $currencyCode);
                })->orWhere(function ($q2) use ($currencyCode) {
                    $q2->where('base_currency', $currencyCode)
                       ->where('quote_currency', 'USD');
                });
            })
            ->whereDate('effective_date', '<=', $date)
            ->orderByDesc('effective_date')
            ->first();

        if (!$record) {
            return 1.0;
        }

        // If base is USD, quote is the currency: rate = quote per USD
        if ($record->base_currency === 'USD') {
            return (float) $record->rate;
        }

        // If base is currency and quote is USD: inverse
        return $record->rate != 0 ? round(1 / (float) $record->rate, 6) : 1.0;
    }
}
