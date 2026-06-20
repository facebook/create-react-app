<?php

namespace App\Modules\Inventory\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class GoodsReceipt extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'receipt_number',
        'supplier_name',
        'supplier_reference',
        'receipt_date',
        'status',
        'notes',
        'warehouse_id',
        'received_by',
        'confirmed_at',
        'created_by',
    ];

    protected $casts = [
        'receipt_date'  => 'date',
        'confirmed_at'  => 'datetime',
    ];

    protected $attributes = [
        'status' => 'draft',
    ];

    // Relations

    public function items(): HasMany
    {
        return $this->hasMany(GoodsReceiptItem::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Methods

    public function confirm(int $userId): void
    {
        if ($this->receipt_number === null) {
            $this->receipt_number = $this->generateReceiptNumber();
        }
        $this->status       = 'confirmed';
        $this->confirmed_at = now();
        $this->received_by  = $userId;
        $this->save();
    }

    public function post(): void
    {
        $this->status = 'posted';
        $this->save();
    }

    public function reject(): void
    {
        $this->status = 'rejected';
        $this->save();
    }

    public function generateReceiptNumber(): string
    {
        return 'GR-' . date('Y') . '-' . str_pad((string) $this->id, 5, '0', STR_PAD_LEFT);
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

    protected function totalItems(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->items()->count(),
        );
    }
}
