<?php

namespace App\Modules\Finance\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DebitNoteItem extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'debit_note_id', 'description',
        'quantity', 'unit_price', 'tax_rate', 'line_total',
    ];

    protected $casts = [
        'quantity'   => 'float',
        'unit_price' => 'float',
        'tax_rate'   => 'float',
        'line_total' => 'float',
    ];

    public function debitNote(): BelongsTo
    {
        return $this->belongsTo(DebitNote::class);
    }

    public function getLineTotalAttribute(): float
    {
        return (float) $this->quantity * (float) $this->unit_price;
    }
}
