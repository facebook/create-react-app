<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BinStockLocation extends Model
{
    use BelongsToTenant;

    protected $table = 'bin_stock_locations';

    protected $fillable = [
        'tenant_id',
        'bin_id',
        'product_id',
        'quantity',
        'lot_number',
        'expiry_date',
    ];

    protected $casts = [
        'quantity'    => 'decimal:4',
        'expiry_date' => 'date',
    ];

    public function bin(): BelongsTo
    {
        return $this->belongsTo(WarehouseBin::class, 'bin_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function getIsExpiredAttribute(): bool
    {
        return $this->expiry_date !== null && $this->expiry_date->isPast();
    }
}
