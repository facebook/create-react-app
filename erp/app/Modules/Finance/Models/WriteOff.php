<?php

namespace App\Modules\Finance\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class WriteOff extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'write_off_number',
        'customer_id',
        'invoice_id',
        'amount',
        'currency',
        'write_off_date',
        'reason',
        'notes',
        'status',
        'approved_by',
        'approved_at',
        'created_by',
    ];

    protected $attributes = [
        'status'   => 'pending',
        'currency' => 'USD',
    ];

    protected $casts = [
        'amount'         => 'float',
        'write_off_date' => 'date',
        'approved_at'    => 'datetime',
    ];

    // Methods

    public function generateWriteOffNumber(): string
    {
        return 'WO-' . date('Y') . '-' . str_pad((string) $this->id, 5, '0', STR_PAD_LEFT);
    }

    public function approve(int $userId): void
    {
        $this->status      = 'approved';
        $this->approved_by = $userId;
        $this->approved_at = now();
        if (is_null($this->write_off_number)) {
            $this->write_off_number = $this->generateWriteOffNumber();
        }
        $this->save();
    }

    public function reverse(): void
    {
        $this->status = 'reversed';
        $this->save();
    }

    // Accessors

    public function getIsPendingAttribute(): bool
    {
        return $this->status === 'pending';
    }

    public function getIsApprovedAttribute(): bool
    {
        return $this->status === 'approved';
    }

    // Relations

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Contact::class, 'customer_id');
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class, 'invoice_id');
    }
}
