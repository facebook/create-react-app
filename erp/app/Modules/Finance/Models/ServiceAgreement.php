<?php

namespace App\Modules\Finance\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ServiceAgreement extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $table = 'service_agreements';

    protected $fillable = [
        'tenant_id', 'contact_id', 'title', 'description', 'agreement_type',
        'status', 'start_date', 'end_date', 'value', 'billing_cycle',
        'auto_renew', 'terms', 'signed_at',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
        'signed_at'  => 'date',
        'value'      => 'decimal:2',
        'auto_renew' => 'boolean',
    ];

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    public function serviceItems(): HasMany
    {
        return $this->hasMany(ServiceAgreementItem::class);
    }

    public function maintenanceLogs(): HasMany
    {
        return $this->hasMany(MaintenanceLog::class);
    }

    public function activate(): void
    {
        $this->status = 'active';
        $this->save();
    }

    public function terminate(): void
    {
        $this->status = 'terminated';
        $this->save();
    }

    public function getIsExpiredAttribute(): bool
    {
        return $this->end_date !== null
            && $this->end_date->isPast()
            && $this->status !== 'terminated';
    }

    public function getIsExpiringAttribute(): bool
    {
        return $this->end_date !== null
            && $this->end_date->diffInDays(now()) <= 30
            && $this->end_date->isFuture()
            && $this->status === 'active';
    }

    public function getDaysRemainingAttribute(): ?int
    {
        if ($this->end_date === null) {
            return null;
        }
        if ($this->end_date->isPast()) {
            return 0;
        }
        return (int) now()->diffInDays($this->end_date);
    }
}
