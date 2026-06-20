<?php

namespace App\Modules\Inventory\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PurchaseOrder extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id', 'po_number', 'supplier_id', 'warehouse_id', 'requisition_id', 'status',
        'order_date', 'expected_date', 'subtotal', 'tax', 'total', 'currency',
        'notes', 'created_by', 'sent_at', 'received_at',
    ];

    protected $casts = [
        'order_date'    => 'date',
        'expected_date' => 'date',
        'subtotal'      => 'float',
        'tax'           => 'float',
        'total'         => 'float',
        'sent_at'       => 'datetime',
        'received_at'   => 'datetime',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public static function generatePoNumber(): string
    {
        return 'PO-' . strtoupper(uniqid());
    }

    public function send(): void
    {
        $this->status  = 'sent';
        $this->sent_at = now();
        $this->save();
    }

    public function cancel(): void
    {
        $this->status = 'cancelled';
        $this->save();
    }

    public function markReceived(): void
    {
        $this->status      = 'received';
        $this->received_at = now();
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
        return in_array($this->status, ['draft', 'sent', 'partial']);
    }

    public function getReceivingProgressAttribute(): float
    {
        $items = $this->items()->get();
        $totalQty = $items->sum('quantity');
        if ($totalQty == 0) {
            return 0.0;
        }
        return round(($items->sum('received_qty') / $totalQty) * 100, 1);
    }
}
