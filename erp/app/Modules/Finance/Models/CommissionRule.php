<?php

namespace App\Modules\Finance\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CommissionRule extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'user_id', 'name', 'rate', 'type', 'fixed_amount', 'is_active',
    ];

    protected $casts = [
        'rate'         => 'decimal:4',
        'fixed_amount' => 'decimal:2',
        'is_active'    => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function commissions(): HasMany
    {
        return $this->hasMany(Commission::class);
    }

    public function calculateCommission(float $invoiceAmount): float
    {
        if ($this->type === 'percentage') {
            return round($invoiceAmount * (float) $this->rate, 2);
        }

        if ($this->type === 'fixed') {
            return (float) $this->fixed_amount;
        }

        return 0.0;
    }
}
