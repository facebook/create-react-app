<?php

namespace App\Modules\Finance\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BillItem extends Model
{
    protected $fillable = [
        'bill_id', 'description', 'quantity', 'unit_price', 'tax_rate',
    ];

    protected $casts = [
        'quantity'   => 'decimal:2',
        'unit_price' => 'decimal:2',
        'tax_rate'   => 'decimal:2',
    ];

    public function bill(): BelongsTo
    {
        return $this->belongsTo(Bill::class);
    }

    public function getSubtotalAttribute(): float
    {
        return (float) $this->quantity * (float) $this->unit_price;
    }

    public function getTaxAttribute(): float
    {
        return $this->subtotal * ((float) $this->tax_rate / 100);
    }

    public function getLineTotalAttribute(): float
    {
        return $this->subtotal + $this->tax;
    }
}
