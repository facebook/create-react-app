<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

class SerialNumber extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'product_id',
        'warehouse_id',
        'serial_number',
        'status',
        'received_date',
        'sold_date',
        'lot_number_id',
        'notes',
    ];

    protected $casts = [
        'received_date' => 'date',
        'sold_date'     => 'date',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function lot(): BelongsTo
    {
        return $this->belongsTo(LotNumber::class, 'lot_number_id');
    }

    public function sell(?string $notes = null): void
    {
        $this->status    = 'sold';
        $this->sold_date = Carbon::today();
        if ($notes !== null) {
            $this->notes = $notes;
        }
        $this->save();
    }

    public function scrap(?string $notes = null): void
    {
        $this->status = 'scrapped';
        if ($notes !== null) {
            $this->notes = $notes;
        }
        $this->save();
    }

    public function getIsAvailableAttribute(): bool
    {
        return $this->status === 'in_stock';
    }
}
