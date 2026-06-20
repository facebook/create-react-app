<?php

namespace App\Modules\Inventory\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RmaRequestItem extends Model
{
    protected $table = 'rma_request_items';

    protected $fillable = [
        'rma_request_id',
        'product_id',
        'description',
        'quantity_requested',
        'quantity_received',
        'condition',
        'disposition',
        'notes',
    ];

    protected $casts = [
        'quantity_requested' => 'float',
        'quantity_received'  => 'float',
    ];

    protected $attributes = [
        'condition'          => 'good',
        'quantity_received'  => 0,
    ];

    public function rmaRequest(): BelongsTo
    {
        return $this->belongsTo(RmaRequest::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
