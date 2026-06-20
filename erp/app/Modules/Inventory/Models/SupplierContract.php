<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class SupplierContract extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'supplier_id',
        'contract_number',
        'title',
        'start_date',
        'end_date',
        'value',
        'status',
        'payment_terms',
        'terms',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
        'value'      => 'float',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function getIsActiveAttribute(): bool
    {
        return $this->status === 'active';
    }

    public function getIsExpiredAttribute(): bool
    {
        return $this->end_date !== null && $this->end_date->isPast();
    }

    public function getIsExpiringAttribute(): bool
    {
        return $this->end_date !== null
            && $this->end_date->isFuture()
            && $this->end_date->diffInDays(now()) <= 30;
    }

    public function getDaysRemainingAttribute(): ?int
    {
        return $this->end_date !== null
            ? max(0, (int) now()->diffInDays($this->end_date, false))
            : null;
    }
}
