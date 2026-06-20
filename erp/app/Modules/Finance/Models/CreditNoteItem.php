<?php

namespace App\Modules\Finance\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CreditNoteItem extends Model
{
    protected $table = 'credit_note_items';

    protected $fillable = [
        'tenant_id', 'credit_note_id', 'description', 'quantity', 'unit_price',
        // Legacy fields
        'tax_rate', 'line_total',
    ];

    protected $casts = [
        'quantity'   => 'float',
        'unit_price' => 'float',
        'tax_rate'   => 'float',
        'line_total' => 'float',
    ];

    public function getLineTotalAttribute(): float
    {
        return round((float) $this->quantity * (float) $this->unit_price, 2);
    }

    public function creditNote(): BelongsTo
    {
        return $this->belongsTo(CreditNote::class);
    }

    protected static function booted(): void
    {
        static::saving(function (self $item) {
            // Keep line_total in sync if column exists
            $item->line_total = round((float) $item->quantity * (float) $item->unit_price, 2);
        });
    }
}
