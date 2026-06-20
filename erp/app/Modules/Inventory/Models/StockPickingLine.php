<?php

namespace App\Modules\Inventory\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockPickingLine extends Model
{
    protected $fillable = [
        'stock_picking_id',
        'product_id',
        'description',
        'qty_demanded',
        'qty_done',
        'lot_id',
        'serial_id',
        'state',
        'notes',
    ];

    protected $attributes = [
        'state'        => 'pending',
        'qty_demanded' => 0,
        'qty_done'     => 0,
    ];

    protected $casts = [
        'qty_demanded' => 'float',
        'qty_done'     => 'float',
    ];

    // Relations

    public function picking(): BelongsTo
    {
        return $this->belongsTo(StockPicking::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function lot(): BelongsTo
    {
        return $this->belongsTo(LotNumber::class, 'lot_id');
    }

    public function serial(): BelongsTo
    {
        return $this->belongsTo(SerialNumber::class, 'serial_id');
    }

    // Accessors

    protected function remainingQty(): Attribute
    {
        return Attribute::make(
            get: fn () => max(0, $this->qty_demanded - $this->qty_done),
        );
    }
}
