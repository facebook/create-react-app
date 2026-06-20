<?php

namespace App\Modules\Purchase\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PoLine extends Model
{
    use BelongsToTenant;

    protected $table = 'po_lines';

    protected $fillable = [
        'tenant_id',
        'po_id',
        'product_name',
        'description',
        'quantity',
        'unit_price',
        'uom',
        'subtotal',
        'received_qty',
    ];

    protected $casts = [
        'quantity'     => 'decimal:3',
        'unit_price'   => 'decimal:2',
        'subtotal'     => 'decimal:2',
        'received_qty' => 'decimal:3',
    ];

    public function po(): BelongsTo
    {
        return $this->belongsTo(Po::class);
    }
}
