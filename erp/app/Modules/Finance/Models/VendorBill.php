<?php

namespace App\Modules\Finance\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use App\Modules\Inventory\Models\Supplier;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class VendorBill extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'bill_number',
        'supplier_id',
        'reference',
        'status',
        'bill_date',
        'due_date',
        'currency',
        'subtotal',
        'tax',
        'total',
        'notes',
        'created_by',
        'approved_by',
        'approved_at',
        'paid_at',
    ];

    protected $casts = [
        'bill_date'   => 'date',
        'due_date'    => 'date',
        'approved_at' => 'datetime',
        'paid_at'     => 'datetime',
        'subtotal'    => 'float',
        'tax'         => 'float',
        'total'       => 'float',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(VendorBillItem::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public static function generateBillNumber(): string
    {
        return 'BILL-' . strtoupper(uniqid());
    }

    public function recalculateTotals(): void
    {
        $this->subtotal = $this->items()->get()->sum(fn ($item) => $item->quantity * $item->unit_price);
        $this->total    = $this->subtotal + $this->tax;
        $this->save();
    }

    public function submit(): void
    {
        $this->status = 'pending';
        $this->save();
    }

    public function approve(int $userId): void
    {
        $this->status      = 'approved';
        $this->approved_by = $userId;
        $this->approved_at = now();
        $this->save();
    }

    public function pay(): void
    {
        $this->status  = 'paid';
        $this->paid_at = now();
        $this->save();
    }

    public function cancel(): void
    {
        $this->status = 'cancelled';
        $this->save();
    }

    public function getIsOverdueAttribute(): bool
    {
        return !in_array($this->status, ['paid', 'cancelled'])
            && $this->due_date !== null
            && $this->due_date->lt(now()->startOfDay());
    }

    public function getIsOpenAttribute(): bool
    {
        return in_array($this->status, ['draft', 'pending', 'approved']);
    }
}
