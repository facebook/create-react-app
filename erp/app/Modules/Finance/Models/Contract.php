<?php

namespace App\Modules\Finance\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\User;

class Contract extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id', 'contact_id', 'contract_number', 'title', 'party_name', 'party_email',
        'reference', 'type', 'status', 'value', 'currency', 'currency_code',
        'start_date', 'end_date', 'auto_renew', 'renewal_notice_days',
        'description', 'terms', 'notes', 'created_by', 'signed_at', 'terminated_at',
    ];

    protected $casts = [
        'value'         => 'float',
        'start_date'    => 'date',
        'end_date'      => 'date',
        'signed_at'     => 'datetime',
        'terminated_at' => 'datetime',
        'auto_renew'    => 'boolean',
    ];

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function renewals(): HasMany
    {
        return $this->hasMany(ContractRenewal::class);
    }

    public function activate(): void
    {
        $this->status    = 'active';
        $this->signed_at = now();
        $this->save();
    }

    public function terminate(string $notes = ''): void
    {
        $this->status        = 'terminated';
        $this->terminated_at = now();
        if ($notes !== '') {
            $this->notes = $notes;
        }
        $this->save();
    }

    public function renew(string $newEndDate, ?float $newValue, string $notes, int $userId): void
    {
        $this->end_date = $newEndDate;
        if ($newValue !== null) {
            $this->value = $newValue;
        }
        ContractRenewal::create([
            'tenant_id'   => $this->tenant_id,
            'contract_id' => $this->id,
            'new_end_date'=> $newEndDate,
            'new_value'   => $newValue,
            'notes'       => $notes,
            'renewed_by'  => $userId,
        ]);
        $this->save();
    }

    public static function generateContractNumber(): string
    {
        return 'CNT-' . strtoupper(uniqid());
    }

    public function getIsExpiredAttribute(): bool
    {
        return $this->end_date !== null
            && $this->end_date->isPast()
            && $this->status !== 'terminated';
    }

    public function getIsExpiringAttribute(): bool
    {
        if ($this->end_date === null || $this->status !== 'active') {
            return false;
        }
        $noticeDays = $this->renewal_notice_days ?? 30;
        return $this->end_date->isFuture()
            && $this->end_date->diffInDays(now(), false) >= -$noticeDays;
    }

    public function getDaysRemainingAttribute(): int
    {
        if ($this->end_date === null) {
            return 0;
        }
        return max(0, (int) today()->diffInDays($this->end_date, false));
    }

    public function scopeExpiringSoon($query)
    {
        return $query->where('status', 'active')
            ->whereBetween('end_date', [now(), now()->addDays(30)]);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
