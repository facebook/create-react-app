<?php

namespace App\Modules\Finance\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use App\Modules\Core\Traits\HasAuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class JournalEntry extends Model
{
    use BelongsToTenant;
    use HasAuditLog;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id', 'date', 'reference', 'description', 'status', 'created_by',
    ];

    protected $casts = [
        'date'   => 'date',
        'status' => 'string',
    ];

    protected $attributes = ['status' => 'draft'];

    public function lines(): HasMany
    {
        return $this->hasMany(JournalLine::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getTotalDebitsAttribute(): float
    {
        return (float) $this->lines->sum('debit');
    }

    public function getTotalCreditsAttribute(): float
    {
        return (float) $this->lines->sum('credit');
    }

    public function isBalanced(): bool
    {
        return abs($this->total_debits - $this->total_credits) < 0.001;
    }

    public function post(): void
    {
        if ($this->status === 'posted') {
            throw new \DomainException('Journal entry is already posted.');
        }

        if (! $this->isBalanced()) {
            throw new \DomainException(
                sprintf(
                    'Journal entry is not balanced (debits %.2f ≠ credits %.2f).',
                    $this->total_debits,
                    $this->total_credits
                )
            );
        }

        $this->update(['status' => 'posted']);
    }
}
