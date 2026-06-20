<?php

namespace App\Modules\Finance\Traits;

trait HasLineItemTotals
{
    public function getSubtotalAttribute(): float
    {
        return $this->items->sum(fn ($i) => (float) $i->quantity * (float) $i->unit_price);
    }

    public function getTaxTotalAttribute(): float
    {
        return $this->items->sum(function ($i) {
            $sub = (float) $i->quantity * (float) $i->unit_price;
            return $sub * ((float) $i->tax_rate / 100);
        });
    }

    public function getTotalAttribute(): float
    {
        return $this->subtotal + $this->tax_total;
    }

    public function getAmountPaidAttribute(): float
    {
        return (float) $this->payments->sum('amount');
    }

    public function getAmountDueAttribute(): float
    {
        return $this->total - $this->amount_paid;
    }

    public function isOverdue(): bool
    {
        return $this->due_date !== null
            && now()->startOfDay()->gt($this->due_date)
            && ! in_array($this->status, ['paid', 'cancelled'], true);
    }
}
