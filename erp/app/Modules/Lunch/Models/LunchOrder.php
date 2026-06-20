<?php

namespace App\Modules\Lunch\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LunchOrder extends Model
{
    use BelongsToTenant;

    protected $table = 'lunch_orders';

    protected $fillable = [
        'tenant_id',
        'employee_id',
        'lunch_product_id',
        'quantity',
        'order_date',
        'status',
        'notes',
        'total_price',
    ];

    protected $casts = [
        'order_date'  => 'date',
        'total_price' => 'decimal:2',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(LunchProduct::class, 'lunch_product_id');
    }

    public function confirm(): bool
    {
        return $this->update(['status' => 'confirmed']);
    }

    public function deliver(): bool
    {
        return $this->update(['status' => 'delivered']);
    }

    public function cancel(): bool
    {
        return $this->update(['status' => 'cancelled']);
    }
}
