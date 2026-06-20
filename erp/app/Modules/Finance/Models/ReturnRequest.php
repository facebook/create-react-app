<?php

namespace App\Modules\Finance\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ReturnRequest extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $table = 'return_requests';

    protected $fillable = [
        'tenant_id', 'invoice_id', 'contact_id', 'reason', 'status',
        'refund_amount', 'notes', 'approved_by', 'approved_at', 'refunded_at',
    ];

    protected $casts = [
        'approved_at'   => 'datetime',
        'refunded_at'   => 'datetime',
        'refund_amount' => 'decimal:2',
    ];

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(ReturnRequestItem::class);
    }

    public function approve(User $user): void
    {
        $this->status      = 'approved';
        $this->approved_by = $user->id;
        $this->approved_at = now();
        $this->save();
    }

    public function reject(): void
    {
        $this->status = 'rejected';
        $this->save();
    }

    public function markRefunded(): void
    {
        $this->status      = 'refunded';
        $this->refunded_at = now();
        $this->save();
    }

    public function getTotalRequestedAttribute(): float
    {
        if ($this->relationLoaded('items')) {
            return (float) $this->items->sum(fn ($item) => $item->quantity * $item->unit_price);
        }
        return 0.0;
    }
}
