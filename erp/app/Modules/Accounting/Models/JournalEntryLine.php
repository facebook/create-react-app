<?php

namespace App\Modules\Accounting\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JournalEntryLine extends Model
{
    protected $table = 'accounting_journal_entry_lines';

    protected $fillable = [
        'journal_entry_id', 'account_id', 'description', 'debit', 'credit',
    ];

    protected $casts = [
        'debit'  => 'float',
        'credit' => 'float',
    ];

    // ─── Relations ───────────────────────────────────────────────────────────

    public function journalEntry(): BelongsTo
    {
        return $this->belongsTo(JournalEntry::class, 'journal_entry_id');
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'account_id');
    }
}
