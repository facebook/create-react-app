<?php

namespace App\Modules\Finance\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CustomerCredit extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'credit_number',
        'customer_name',
        'customer_code',
        'credit_amount',
        'used_amount',
        'currency',
        'reason',
        'status',
        'expiry_date',
        'reference_type',
        'reference_id',
        'notes',
        'issued_by',
        'issued_at',
        'created_by',
    ];

    protected $attributes = [
        'status'      => 'active',
        'currency'    => 'USD',
        'used_amount' => 0,
    ];

    protected $casts = [
        'credit_amount' => 'decimal:2',
        'used_amount'   => 'decimal:2',
        'expiry_date'   => 'date',
        'issued_at'     => 'datetime',
    ];

    // Relations

    public function issuedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Accessors

    protected function remainingAmount(): Attribute
    {
        return Attribute::make(
            get: fn () => max(0, (float) $this->credit_amount - (float) $this->used_amount),
        );
    }

    protected function isActive(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'active',
        );
    }

    protected function isExhausted(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'exhausted',
        );
    }

    protected function isExpired(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'expired'
                || ($this->status === 'active' && $this->expiry_date && $this->expiry_date < now()->startOfDay()),
        );
    }

    // Methods

    public function generateCreditNumber(): string
    {
        return 'CC-' . date('Y') . '-' . str_pad((string) $this->id, 5, '0', STR_PAD_LEFT);
    }

    public function issue(int $userId): void
    {
        $this->issued_by = $userId;
        $this->issued_at = now();
        if (is_null($this->credit_number)) {
            $this->credit_number = $this->generateCreditNumber();
        }
        $this->save();
    }

    public function apply(float $amount): void
    {
        $this->used_amount = (float) $this->used_amount + $amount;
        if ((float) $this->used_amount >= (float) $this->credit_amount) {
            $this->status = 'exhausted';
        }
        $this->save();
    }

    public function expire(): void
    {
        $this->status = 'expired';
        $this->save();
    }

    public function cancel(): void
    {
        $this->status = 'cancelled';
        $this->save();
    }
}
