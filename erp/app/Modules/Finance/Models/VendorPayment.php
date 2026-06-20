<?php

namespace App\Modules\Finance\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class VendorPayment extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'payment_number',
        'vendor_name',
        'vendor_code',
        'amount',
        'currency',
        'payment_method',
        'reference',
        'payment_date',
        'due_date',
        'status',
        'notes',
        'approved_by',
        'approved_at',
        'processed_at',
        'created_by',
    ];

    protected $attributes = [
        'status'         => 'pending',
        'currency'       => 'USD',
        'payment_method' => 'bank_transfer',
    ];

    protected $casts = [
        'amount'       => 'decimal:2',
        'payment_date' => 'date',
        'due_date'     => 'date',
        'approved_at'  => 'datetime',
        'processed_at' => 'datetime',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // ── Status transitions ────────────────────────────────────────────────────

    public function approve(int $userId): void
    {
        $this->status      = 'approved';
        $this->approved_by = $userId;
        $this->approved_at = now();

        if (is_null($this->payment_number)) {
            $this->payment_number = $this->generatePaymentNumber();
        }

        $this->save();
    }

    public function process(): void
    {
        $this->status       = 'processed';
        $this->processed_at = now();
        $this->save();
    }

    public function reject(): void
    {
        $this->status = 'rejected';
        $this->save();
    }

    public function cancel(): void
    {
        $this->status = 'cancelled';
        $this->save();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    public function generatePaymentNumber(): string
    {
        return 'VP-' . date('Y') . '-' . str_pad((string) $this->id, 5, '0', STR_PAD_LEFT);
    }

    // ── Accessors ─────────────────────────────────────────────────────────────

    public function getIsPendingAttribute(): bool
    {
        return $this->status === 'pending';
    }

    public function getIsApprovedAttribute(): bool
    {
        return $this->status === 'approved';
    }

    public function getIsProcessedAttribute(): bool
    {
        return $this->status === 'processed';
    }

    public function getIsOverdueAttribute(): bool
    {
        return $this->is_pending
            && $this->due_date !== null
            && $this->due_date->lt(now()->startOfDay());
    }
}
