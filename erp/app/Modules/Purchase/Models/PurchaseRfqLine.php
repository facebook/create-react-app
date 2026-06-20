<?php

namespace App\Modules\Purchase\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseRfqLine extends Model
{
    use BelongsToTenant;

    protected $table = 'po_rfq_lines';

    protected $fillable = [
        'tenant_id',
        'po_rfq_id',
        'product_name',
        'description',
        'quantity',
        'unit_price',
        'uom',
        'subtotal',
    ];

    protected $casts = [
        'quantity'   => 'decimal:3',
        'unit_price' => 'decimal:2',
        'subtotal'   => 'decimal:2',
    ];

    public function rfq(): BelongsTo
    {
        return $this->belongsTo(PurchaseRfq::class, 'po_rfq_id');
    }
}
