<?php

namespace App\Modules\Accounting\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccountBalance extends Model
{
    use BelongsToTenant;

    protected $table = 'account_balances';

    protected $fillable = [
        'tenant_id', 'account_id', 'period_id',
        'opening_balance', 'debit_total', 'credit_total', 'closing_balance',
    ];

    protected $casts = [
        'opening_balance' => 'float',
        'debit_total'     => 'float',
        'credit_total'    => 'float',
        'closing_balance' => 'float',
    ];

    // ─── Relations ───────────────────────────────────────────────────────────

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'account_id');
    }

    public function period(): BelongsTo
    {
        return $this->belongsTo(AccountingPeriod::class, 'period_id');
    }
}
