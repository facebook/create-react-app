<?php

namespace App\Modules\Finance\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use App\Modules\Core\Traits\HasAuditLog;
use App\Modules\Finance\Traits\HasLineItemTotals;
use App\Modules\Finance\Traits\HasStatusTransitions;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Quote extends Model
{
    use BelongsToTenant;
    use HasAuditLog;
    use SoftDeletes;
    use HasLineItemTotals;
    use HasStatusTransitions;

    protected $fillable = [
        'tenant_id', 'contact_id', 'number',
        'issue_date', 'expiry_date', 'status', 'notes', 'created_by',
        'currency_code', 'exchange_rate',
    ];

    protected $casts = [
        'issue_date'    => 'date',
        'expiry_date'   => 'date',
        'exchange_rate' => 'float',
    ];

    protected $attributes = ['status' => 'draft'];

    protected function getTransitions(): array
    {
        return [
            'draft'     => ['sent', 'cancelled'],
            'sent'      => ['accepted', 'declined', 'cancelled'],
            'accepted'  => [],
            'declined'  => [],
            'cancelled' => [],
        ];
    }

    public function getBaseTotalAttribute(): float
    {
        return round($this->total * (float) $this->exchange_rate, 2);
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(QuoteItem::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
