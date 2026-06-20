<?php

namespace App\Modules\Accounting\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AccountingPeriod extends Model
{
    use BelongsToTenant;

    protected $table = 'accounting_periods';

    protected $fillable = [
        'tenant_id', 'name', 'start_date', 'end_date', 'status', 'fiscal_year', 'quarter',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
    ];

    // ─── Relations ───────────────────────────────────────────────────────────

    public function journalEntries(): HasMany
    {
        return $this->hasMany(JournalEntry::class, 'period_id');
    }

    public function balances(): HasMany
    {
        return $this->hasMany(AccountBalance::class, 'period_id');
    }

    // ─── Business Logic ───────────────────────────────────────────────────────

    public function isClosed(): bool
    {
        return $this->status === 'closed' || $this->status === 'locked';
    }

    public function close(): void
    {
        $this->status = 'closed';
        $this->save();
    }
}
