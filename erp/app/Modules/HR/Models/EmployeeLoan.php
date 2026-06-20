<?php

namespace App\Modules\HR\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class EmployeeLoan extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id', 'employee_id', 'type', 'amount', 'outstanding_balance',
        'interest_rate', 'status', 'approved_by', 'approved_at', 'disbursed_at',
        'purpose', 'notes', 'repayment_start_date',
    ];

    protected $casts = [
        'amount'               => 'decimal:2',
        'outstanding_balance'  => 'decimal:2',
        'interest_rate'        => 'decimal:2',
        'approved_at'          => 'datetime',
        'disbursed_at'         => 'datetime',
        'repayment_start_date' => 'date',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function repayments(): HasMany
    {
        return $this->hasMany(LoanRepayment::class);
    }

    public function approve(User $user): void
    {
        $this->status      = 'active';
        $this->approved_by = $user->id;
        $this->approved_at = now();
        $this->disbursed_at = now();
        $this->save();
    }

    public function cancel(): void
    {
        $this->status = 'cancelled';
        $this->save();
    }

    public function getTotalRepaidAttribute(): float
    {
        return (float) $this->repayments->sum('amount');
    }

    public function getIsFullyRepaidAttribute(): bool
    {
        return (float) $this->outstanding_balance <= 0;
    }
}
