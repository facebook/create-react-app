<?php

namespace App\Modules\Finance\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BankReconciliation extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'bank_account_id', 'statement_date', 'statement_balance',
        'reconciled_balance', 'status', 'notes', 'completed_by', 'completed_at',
    ];

    protected $casts = [
        'statement_balance'  => 'float',
        'reconciled_balance' => 'float',
        'statement_date'     => 'date',
        'completed_at'       => 'datetime',
    ];

    public function account(): BelongsTo
    {
        return $this->belongsTo(BankAccount::class, 'bank_account_id');
    }

    public function completedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'completed_by');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(BankTransaction::class, 'reconciliation_id');
    }

    public function getDifferenceAttribute(): float
    {
        return $this->statement_balance - $this->reconciled_balance;
    }

    public function getIsBalancedAttribute(): bool
    {
        return abs($this->difference) < 0.01;
    }

    public function complete(User $user): void
    {
        $this->reconciled_balance = $this->transactions()->sum('amount');
        $this->status             = 'completed';
        $this->completed_by       = $user->id;
        $this->completed_at       = now();
        $this->save();

        $this->transactions()->update(['is_reconciled' => true]);
    }
}
