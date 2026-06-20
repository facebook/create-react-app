<?php

namespace App\Modules\Accounting\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BankTransaction extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'bank_account_id',
        'journal_entry_id',
        'transaction_date',
        'reference',
        'description',
        'type',
        'amount',
        'status',
        'reconciled_at',
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'reconciled_at'    => 'datetime',
        'amount'           => 'float',
    ];

    public function bankAccount(): BelongsTo
    {
        return $this->belongsTo(BankAccount::class, 'bank_account_id');
    }

    public function journalEntry(): BelongsTo
    {
        return $this->belongsTo(JournalEntry::class, 'journal_entry_id');
    }

    public function reconcile(): void
    {
        $this->status        = 'reconciled';
        $this->reconciled_at = now();
        $this->save();

        $this->bankAccount->last_reconciled_at = now()->toDateString();
        $this->bankAccount->save();
    }

    public function unreconcile(): void
    {
        $this->status        = 'unreconciled';
        $this->reconciled_at = null;
        $this->save();
    }
}
