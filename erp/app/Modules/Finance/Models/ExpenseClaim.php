<?php

namespace App\Modules\Finance\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ExpenseClaim extends Model
{
    protected $table = 'finance_expense_claims';

    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'reference',
        'submitted_by',
        'approved_by',
        'status',
        'claim_date',
        'currency',
        'total_amount',
        'notes',
        'submitted_at',
        'approved_at',
        'paid_at',
    ];

    protected $casts = [
        'claim_date'   => 'date',
        'submitted_at' => 'datetime',
        'approved_at'  => 'datetime',
        'paid_at'      => 'datetime',
        'total_amount' => 'float',
    ];

    public function submittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(ExpenseItem::class);
    }

    public static function generateReference(): string
    {
        return 'EXP-' . strtoupper(uniqid());
    }

    public function submit(): void
    {
        $this->status       = 'submitted';
        $this->submitted_at = now();
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

    public function markPaid(): void
    {
        $this->status  = 'paid';
        $this->paid_at = now();
        $this->save();
    }

    public function recalculate(): void
    {
        $this->total_amount = $this->items()->sum('amount');
        $this->save();
    }

    public function getIsEditableAttribute(): bool
    {
        return $this->status === 'draft';
    }
}
