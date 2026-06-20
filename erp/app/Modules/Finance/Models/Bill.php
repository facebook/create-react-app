<?php

namespace App\Modules\Finance\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use App\Modules\Core\Traits\HasAuditLog;
use App\Modules\Finance\Traits\HasLineItemTotals;
use App\Modules\Finance\Traits\HasAttachments;
use App\Modules\Finance\Traits\HasStatusTransitions;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Bill extends Model
{
    use BelongsToTenant;
    use HasAuditLog;
    use SoftDeletes;
    use HasLineItemTotals;
    use HasAttachments;
    use HasStatusTransitions;

    protected $fillable = [
        'tenant_id', 'contact_id', 'number',
        'issue_date', 'due_date', 'status', 'notes', 'created_by',
        'currency_code', 'exchange_rate',
    ];

    protected $casts = [
        'issue_date'    => 'date',
        'due_date'      => 'date',
        'exchange_rate' => 'float',
    ];

    protected $attributes = ['status' => 'draft'];

    protected function getTransitions(): array
    {
        return [
            'draft'     => ['received', 'cancelled'],
            'received'  => ['partial', 'paid', 'cancelled'],
            'partial'   => ['paid', 'cancelled'],
            'paid'      => [],
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
        return $this->hasMany(BillItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(BillPayment::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
