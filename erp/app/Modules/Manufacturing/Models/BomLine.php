<?php

namespace App\Modules\Manufacturing\Models;

use App\Modules\Inventory\Models\Product;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BomLine extends Model
{
    protected $table = 'bom_lines';

    protected $fillable = [
        'bom_id', 'component_id', 'quantity', 'uom',
        'sequence', 'is_optional', 'notes',
    ];

    protected $casts = [
        'quantity'    => 'float',
        'is_optional' => 'boolean',
        'sequence'    => 'integer',
    ];

    protected $attributes = [
        'quantity'    => 1,
        'sequence'    => 10,
        'is_optional' => false,
    ];

    public function bom(): BelongsTo
    {
        return $this->belongsTo(BillOfMaterials::class, 'bom_id');
    }

    public function component(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'component_id');
    }
}
