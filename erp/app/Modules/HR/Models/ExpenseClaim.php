<?php

namespace App\Modules\HR\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ExpenseClaim extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $table = 'expense_claims';

    protected $fillable = [
        'tenant_id', 'employee_id', 'title', 'description', 'status',
        'total_amount', 'submitted_at', 'approved_by', 'approved_at',
        'paid_at', 'rejection_reason', 'notes',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'submitted_at' => 'datetime',
        'approved_at'  => 'datetime',
        'paid_at'      => 'datetime',
        'status'       => 'string',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(ExpenseClaimItem::class);
    }

    public function submit(): void
    {
        $this->status       = 'submitted';
        $this->submitted_at = now();
        $this->save();
    }

    public function approve(User $user): void
    {
        $this->status      = 'approved';
        $this->approved_by = $user->id;
        $this->approved_at = now();
        $this->save();
    }

    public function reject(string $reason): void
    {
        $this->status           = 'rejected';
        $this->rejection_reason = $reason;
        $this->save();
    }

    public function markPaid(): void
    {
        $this->status  = 'paid';
        $this->paid_at = now();
        $this->save();
    }

    public function recalculateTotal(): void
    {
        $this->total_amount = $this->items()->sum('amount');
        $this->save();
    }

    public function getTotalItemsAttribute(): int
    {
        return $this->items()->count();
    }
}
