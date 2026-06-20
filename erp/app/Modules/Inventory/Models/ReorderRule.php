<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ReorderRule extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'product_id',
        'warehouse_id',
        'rule_number',
        'reorder_point',
        'reorder_quantity',
        'max_stock_level',
        'rule_type',
        'is_active',
        'status',
        'last_triggered_at',
        'created_by',
    ];

    protected $attributes = [
        'status'           => 'active',
        'rule_type'        => 'fixed',
        'is_active'        => true,
        'reorder_point'    => 0,
        'reorder_quantity' => 0,
    ];

    protected $casts = [
        'reorder_point'    => 'decimal:2',
        'reorder_quantity' => 'decimal:2',
        'max_stock_level'  => 'decimal:2',
        'is_active'        => 'boolean',
        'last_triggered_at' => 'datetime',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function trigger(): void
    {
        $this->status = 'triggered';
        $this->last_triggered_at = now();
        $this->save();
    }

    public function pause(): void
    {
        $this->status = 'paused';
        $this->save();
    }

    public function resume(): void
    {
        $this->status = 'active';
        $this->save();
    }

    public function generateRuleNumber(): string
    {
        return 'RR-' . date('Y') . '-' . str_pad((string) $this->id, 5, '0', STR_PAD_LEFT);
    }

    public function getIsTriggeredAttribute(): bool
    {
        return $this->status === 'triggered';
    }

    public function getIsPausedAttribute(): bool
    {
        return $this->status === 'paused';
    }

    public function getNeedsReorderAttribute(): bool
    {
        return $this->is_active && $this->status === 'active';
    }
}
