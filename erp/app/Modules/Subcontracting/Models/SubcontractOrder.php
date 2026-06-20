<?php

namespace App\Modules\Subcontracting\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class SubcontractOrder extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $table = 'subcontracts';

    protected $fillable = [
        'tenant_id',
        'vendor_id',
        'reference',
        'status',
        'finished_product',
        'finished_qty',
        'unit_price',
        'notes',
        'sent_at',
        'received_at',
    ];

    protected $casts = [
        'finished_qty'  => 'float',
        'unit_price'    => 'float',
        'sent_at'       => 'datetime',
        'received_at'   => 'datetime',
    ];

    /** @param \Illuminate\Database\Eloquent\Builder<static> $query */
    public function scopeByStatus($query, string $status): void
    {
        $query->where('status', $status);
    }

    public function components(): HasMany
    {
        return $this->hasMany(SubcontractComponent::class, 'subcontract_id');
    }

    public function send(): void
    {
        $this->status  = 'sent';
        $this->sent_at = now();
        $this->save();
    }

    public function startProduction(): void
    {
        $this->status = 'in_progress';
        $this->save();
    }

    public function receive(): void
    {
        $this->status      = 'received';
        $this->received_at = now();
        $this->save();
    }

    public function cancel(): void
    {
        $this->status = 'cancelled';
        $this->save();
    }

    public function totalCost(): float
    {
        return (float) ($this->unit_price * $this->finished_qty);
    }

    public function canTransitionTo(string $status): bool
    {
        $allowed = [
            'draft'       => ['sent', 'cancelled'],
            'sent'        => ['in_progress', 'cancelled'],
            'in_progress' => ['received', 'cancelled'],
            'received'    => [],
            'cancelled'   => [],
        ];

        return in_array($status, $allowed[$this->status] ?? [], true);
    }
}
