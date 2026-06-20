<?php

namespace App\Modules\Inventory\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class SalesOrder extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $table = 'sales_orders';

    protected $fillable = [
        'tenant_id', 'so_number', 'customer_id', 'status',
        'order_date', 'expected_date', 'subtotal', 'tax', 'total',
        'currency', 'notes', 'created_by',
        'confirmed_at', 'shipped_at', 'delivered_at',
    ];

    protected $casts = [
        'order_date'    => 'date',
        'expected_date' => 'date',
        'subtotal'      => 'float',
        'tax'           => 'float',
        'total'         => 'float',
        'confirmed_at'  => 'datetime',
        'shipped_at'    => 'datetime',
        'delivered_at'  => 'datetime',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(SalesOrderItem::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public static function generateSoNumber(): string
    {
        return 'SO-' . strtoupper(uniqid());
    }

    public function confirm(): void
    {
        $this->status       = 'confirmed';
        $this->confirmed_at = now();
        $this->save();
    }

    public function ship(): void
    {
        $this->status     = 'shipped';
        $this->shipped_at = now();
        $this->save();
    }

    public function deliver(): void
    {
        $this->status       = 'delivered';
        $this->delivered_at = now();
        $this->save();
    }

    public function cancel(): void
    {
        $this->status = 'cancelled';
        $this->save();
    }

    public function recalculateTotals(): void
    {
        $subtotal       = $this->items()->get()->sum(fn ($i) => $i->quantity * $i->unit_price);
        $this->subtotal = $subtotal;
        $this->total    = $subtotal + $this->tax;
        $this->save();
    }

    public function getIsOpenAttribute(): bool
    {
        return in_array($this->status, ['draft', 'confirmed']);
    }
}
