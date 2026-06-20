<?php

namespace App\Modules\Inventory\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Shipment extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'shipment_number',
        'type',
        'status',
        'carrier',
        'tracking_number',
        'service_level',
        'origin_address',
        'destination_address',
        'ship_date',
        'estimated_delivery',
        'actual_delivery',
        'weight_kg',
        'freight_cost',
        'notes',
        'warehouse_id',
        'created_by',
    ];

    protected $casts = [
        'ship_date'          => 'date',
        'estimated_delivery' => 'date',
        'actual_delivery'    => 'date',
        'weight_kg'          => 'float',
        'freight_cost'       => 'float',
    ];

    protected $attributes = [
        'type'   => 'outbound',
        'status' => 'pending',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(ShipmentItem::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function dispatch(): void
    {
        if ($this->shipment_number === null) {
            $this->shipment_number = $this->generateShipmentNumber();
        }
        $this->status    = 'in-transit';
        $this->ship_date = $this->ship_date ?? now()->toDateString();
        $this->save();
    }

    public function deliver(): void
    {
        $this->status          = 'delivered';
        $this->actual_delivery = now()->toDateString();
        $this->save();
    }

    public function returnShipment(): void
    {
        $this->status = 'returned';
        $this->save();
    }

    public function cancel(): void
    {
        $this->status = 'cancelled';
        $this->save();
    }

    public function generateShipmentNumber(): string
    {
        $prefix = $this->type === 'inbound' ? 'SHI' : 'SHO';
        return $prefix . '-' . date('Y') . '-' . str_pad((string) $this->id, 5, '0', STR_PAD_LEFT);
    }

    protected function isPending(): Attribute
    {
        return Attribute::make(get: fn () => $this->status === 'pending');
    }

    protected function isInTransit(): Attribute
    {
        return Attribute::make(get: fn () => $this->status === 'in-transit');
    }

    protected function isDelivered(): Attribute
    {
        return Attribute::make(get: fn () => $this->status === 'delivered');
    }

    protected function totalItems(): Attribute
    {
        return Attribute::make(get: fn () => $this->items()->count());
    }
}
