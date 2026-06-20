<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PurchaseRequest extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'request_number',
        'title',
        'description',
        'department',
        'estimated_cost',
        'currency',
        'priority',
        'status',
        'required_by',
        'justification',
        'requested_by',
        'approved_by',
        'approved_at',
        'submitted_at',
        'created_by',
    ];

    protected $attributes = [
        'status'         => 'draft',
        'priority'       => 'medium',
        'currency'       => 'USD',
        'estimated_cost' => 0,
    ];

    protected $casts = [
        'estimated_cost' => 'decimal:2',
        'required_by'    => 'date',
        'approved_at'    => 'datetime',
        'submitted_at'   => 'datetime',
    ];

    // ── State transitions ──────────────────────────────────────────────────

    public function submit(): void
    {
        $this->status       = 'submitted';
        $this->submitted_at = now();

        if ($this->request_number === null) {
            $this->request_number = $this->generateRequestNumber();
        }

        $this->save();
    }

    public function approve(int $userId): void
    {
        $this->status      = 'approved';
        $this->approved_by = $userId;
        $this->approved_at = now();
        $this->save();
    }

    public function reject(): void
    {
        $this->status = 'rejected';
        $this->save();
    }

    public function markOrdered(): void
    {
        $this->status = 'ordered';
        $this->save();
    }

    public function cancel(): void
    {
        $this->status = 'cancelled';
        $this->save();
    }

    public function generateRequestNumber(): string
    {
        return 'PR-' . date('Y') . '-' . str_pad((string) $this->id, 5, '0', STR_PAD_LEFT);
    }

    // ── Accessors ──────────────────────────────────────────────────────────

    public function getIsDraftAttribute(): bool
    {
        return $this->status === 'draft';
    }

    public function getIsSubmittedAttribute(): bool
    {
        return $this->status === 'submitted';
    }

    public function getIsApprovedAttribute(): bool
    {
        return $this->status === 'approved';
    }
}
