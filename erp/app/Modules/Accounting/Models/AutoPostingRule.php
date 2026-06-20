<?php

namespace App\Modules\Accounting\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AutoPostingRule extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'bank_account_id',
        'debit_account_id',
        'credit_account_id',
        'name',
        'match_keyword',
        'match_type',
        'is_active',
    ];

    protected $attributes = [
        'is_active' => true,
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function bankAccount(): BelongsTo
    {
        return $this->belongsTo(BankAccount::class, 'bank_account_id');
    }

    public function debitAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'debit_account_id');
    }

    public function creditAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'credit_account_id');
    }

    public function matches(BankTransaction $transaction): bool
    {
        if (!$this->is_active || !$this->match_keyword) {
            return false;
        }

        $keyword = strtolower($this->match_keyword);
        $value   = match ($this->match_type) {
            'description' => strtolower($transaction->description ?? ''),
            'reference'   => strtolower($transaction->reference ?? ''),
            'amount'      => (string) $transaction->amount,
            default       => '',
        };

        return str_contains($value, $keyword);
    }
}
