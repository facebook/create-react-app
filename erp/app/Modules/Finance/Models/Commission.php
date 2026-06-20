<?php

namespace App\Modules\Finance\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Commission extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id', 'commission_rule_id', 'user_id', 'invoice_id',
        'invoice_amount', 'commission_amount', 'status',
        'approved_at', 'paid_at', 'notes',
    ];

    protected $casts = [
        'invoice_amount'    => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'approved_at'       => 'datetime',
        'paid_at'           => 'datetime',
    ];

    public function rule(): BelongsTo
    {
        return $this->belongsTo(CommissionRule::class, 'commission_rule_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function approve(): void
    {
        $this->status      = 'approved';
        $this->approved_at = now();
        $this->save();
    }

    public function markPaid(): void
    {
        $this->status  = 'paid';
        $this->paid_at = now();
        $this->save();
    }
}
