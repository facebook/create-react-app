<?php

namespace App\Modules\Accounting\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JournalEntry extends Model
{
    use BelongsToTenant;

    protected $table = 'accounting_journal_entries';

    protected $fillable = [
        'tenant_id', 'entry_number', 'reference', 'description', 'entry_date',
        'period_id', 'status', 'is_adjusting', 'reversed_by', 'created_by',
        'posted_by', 'posted_at',
    ];

    protected $casts = [
        'entry_date'  => 'date',
        'posted_at'   => 'datetime',
        'is_adjusting' => 'boolean',
    ];

    // ─── Relations ───────────────────────────────────────────────────────────

    public function lines(): HasMany
    {
        return $this->hasMany(JournalEntryLine::class, 'journal_entry_id');
    }

    public function period(): BelongsTo
    {
        return $this->belongsTo(AccountingPeriod::class, 'period_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function poster(): BelongsTo
    {
        return $this->belongsTo(User::class, 'posted_by');
    }

    public function reversedBy(): BelongsTo
    {
        return $this->belongsTo(JournalEntry::class, 'reversed_by');
    }

    // ─── Business Logic ───────────────────────────────────────────────────────

    public function generateEntryNumber(): string
    {
        return 'JE-' . date('Y') . '-' . str_pad((string) $this->id, 5, '0', STR_PAD_LEFT);
    }

    public function isBalanced(): bool
    {
        return abs($this->lines->sum('debit') - $this->lines->sum('credit')) < 0.01;
    }

    public function totalDebits(): float
    {
        return (float) $this->lines->sum('debit');
    }

    public function totalCredits(): float
    {
        return (float) $this->lines->sum('credit');
    }

    public function post(): void
    {
        if ($this->status === 'posted') {
            throw new \DomainException('Journal entry is already posted.');
        }

        $this->load('lines');

        if (! $this->isBalanced()) {
            throw new \DomainException(
                sprintf(
                    'Journal entry is not balanced (debits %.2f ≠ credits %.2f).',
                    $this->totalDebits(),
                    $this->totalCredits()
                )
            );
        }

        $this->status    = 'posted';
        $this->posted_at = now();
        $this->posted_by = auth()->id();
        $this->save();
    }

    public function reverse(string $description = ''): self
    {
        $this->load('lines');

        $newEntry = static::create([
            'tenant_id'   => $this->tenant_id,
            'reference'   => $this->reference,
            'description' => $description ?: 'Reversal of ' . ($this->entry_number ?? $this->id),
            'entry_date'  => now()->toDateString(),
            'period_id'   => $this->period_id,
            'is_adjusting' => $this->is_adjusting,
            'created_by'  => auth()->id(),
            'status'      => 'draft',
        ]);

        $newEntry->entry_number = $newEntry->generateEntryNumber();
        $newEntry->save();

        foreach ($this->lines as $line) {
            JournalEntryLine::create([
                'journal_entry_id' => $newEntry->id,
                'account_id'       => $line->account_id,
                'description'      => $line->description,
                'debit'            => $line->credit,
                'credit'           => $line->debit,
            ]);
        }

        $newEntry->load('lines');
        $newEntry->post();

        // Mark original as reversed
        $this->status      = 'reversed';
        $this->reversed_by = $newEntry->id;
        $this->save();

        return $newEntry;
    }
}
