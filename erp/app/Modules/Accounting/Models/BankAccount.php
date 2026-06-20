<?php

namespace App\Modules\Accounting\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BankAccount extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'account_id',
        'name',
        'bank_name',
        'account_number',
        'currency',
        'current_balance',
        'last_reconciled_at',
        'is_active',
    ];

    protected $casts = [
        'current_balance'    => 'float',
        'is_active'          => 'boolean',
        'last_reconciled_at' => 'date',
    ];

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'account_id');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(BankTransaction::class, 'bank_account_id');
    }

    public function autoPostingRules(): HasMany
    {
        return $this->hasMany(AutoPostingRule::class, 'bank_account_id');
    }

    public function unreconciledTransactions(): HasMany
    {
        return $this->transactions()->where('status', 'unreconciled');
    }

    public function reconciledBalance(): float
    {
        $debits  = $this->transactions()->where('status', 'reconciled')->where('type', 'debit')->sum('amount');
        $credits = $this->transactions()->where('status', 'reconciled')->where('type', 'credit')->sum('amount');

        return (float) ($credits - $debits);
    }
}
