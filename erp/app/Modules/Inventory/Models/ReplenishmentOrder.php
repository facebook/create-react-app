<?php

namespace App\Modules\Inventory\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ReplenishmentOrder extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'order_number',
        'product_id',
        'warehouse_id',
        'qty_on_hand',
        'qty_needed',
        'qty_to_order',
        'route',
        'status',
        'scheduled_date',
        'supplier_id',
        'reorder_rule_id',
        'notes',
        'created_by',
    ];

    protected $attributes = [
        'route'       => 'buy',
        'status'      => 'draft',
        'qty_on_hand' => 0,
    ];

    protected $casts = [
        'qty_on_hand'    => 'float',
        'qty_needed'     => 'float',
        'qty_to_order'   => 'float',
        'scheduled_date' => 'date',
    ];

    // Relations

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function reorderRule(): BelongsTo
    {
        return $this->belongsTo(ReorderRule::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Methods

    public function confirm(): void
    {
        if ($this->order_number === null) {
            $this->order_number = $this->generateOrderNumber();
        }
        $this->status = 'confirmed';
        $this->save();
    }

    public function markInProgress(): void
    {
        $this->status = 'in_progress';
        $this->save();
    }

    public function complete(): void
    {
        $this->status = 'done';
        $this->save();
    }

    public function cancel(): void
    {
        $this->status = 'cancelled';
        $this->save();
    }

    public function generateOrderNumber(): string
    {
        return 'REP-' . date('Y') . '-' . str_pad((string) $this->id, 5, '0', STR_PAD_LEFT);
    }

    // Accessors

    protected function isDraft(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'draft',
        );
    }

    protected function isConfirmed(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'confirmed',
        );
    }

    protected function routeLabel(): Attribute
    {
        return Attribute::make(
            get: fn () => match ($this->route) {
                'manufacture' => 'Manufacturing Order',
                'resupply'    => 'Internal Transfer',
                default       => 'Purchase Order',
            },
        );
    }
}
