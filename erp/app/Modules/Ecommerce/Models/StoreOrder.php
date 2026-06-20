<?php

namespace App\Modules\Ecommerce\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class StoreOrder extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $table = 'store_orders';

    protected $fillable = [
        'tenant_id',
        'order_number',
        'status',
        'customer_name',
        'customer_email',
        'customer_phone',
        'shipping_address',
        'billing_address',
        'subtotal',
        'discount_amount',
        'shipping_amount',
        'tax_amount',
        'total',
        'payment_method',
        'payment_status',
        'notes',
        'ip_address',
        'processed_by',
    ];

    protected $casts = [
        'subtotal'        => 'float',
        'discount_amount' => 'float',
        'shipping_amount' => 'float',
        'tax_amount'      => 'float',
        'total'           => 'float',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(StoreOrderItem::class, 'order_id');
    }

    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function generateOrderNumber(): string
    {
        return 'SO-' . date('Y') . '-' . str_pad((string) $this->id, 5, '0', STR_PAD_LEFT);
    }

    public function confirm(): void
    {
        $this->status = 'confirmed';
        $this->save();
    }

    public function markPaid(): void
    {
        $this->payment_status = 'paid';
        $this->save();

        if ($this->status === 'pending') {
            $this->confirm();
        }
    }

    public function ship(): void
    {
        $this->status = 'shipped';
        $this->save();
    }

    public function deliver(): void
    {
        $this->status = 'delivered';
        $this->save();
    }

    public function cancel(): void
    {
        $this->status = 'cancelled';
        $this->save();
    }
}
