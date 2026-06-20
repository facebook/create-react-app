<?php

namespace App\Modules\Manufacturing\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use App\Modules\Inventory\Models\Product;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ScrapOrder extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $table = 'scrap_orders';

    protected $fillable = [
        'tenant_id',
        'manufacturing_order_id',
        'product_id',
        'quantity',
        'uom',
        'reason',
        'scrapped_by',
        'scrapped_at',
    ];

    protected $casts = [
        'scrapped_at' => 'datetime',
        'quantity'    => 'float',
    ];

    public function manufacturingOrder(): BelongsTo
    {
        return $this->belongsTo(ManufacturingOrder::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function scrappedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'scrapped_by');
    }

    public function scrap(): void
    {
        $this->scrapped_at = now();
        $this->scrapped_by = auth()->id();
        $this->save();
    }
}
