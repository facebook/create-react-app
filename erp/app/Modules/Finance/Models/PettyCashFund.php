<?php

namespace App\Modules\Finance\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PettyCashFund extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'name',
        'custodian_id',
        'authorized_amount',
        'current_balance',
        'currency',
        'is_active',
        'last_replenished_at',
    ];

    protected $casts = [
        'authorized_amount'   => 'float',
        'current_balance'     => 'float',
        'is_active'           => 'boolean',
        'last_replenished_at' => 'datetime',
    ];

    public function custodian(): BelongsTo
    {
        return $this->belongsTo(User::class, 'custodian_id');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(PettyCashTransaction::class, 'fund_id');
    }

    public function replenish(float $amount, int $userId): void
    {
        $this->current_balance     = $this->current_balance + $amount;
        $this->last_replenished_at = now();
        $this->save();

        PettyCashTransaction::create([
            'tenant_id'        => $this->tenant_id,
            'fund_id'          => $this->id,
            'type'             => 'replenishment',
            'amount'           => $amount,
            'description'      => 'Fund replenishment',
            'transaction_date' => now()->toDateString(),
            'created_by'       => $userId,
        ]);
    }

    public function addExpense(float $amount, string $description, string $date, int $userId, ?string $category = null): void
    {
        $this->current_balance = $this->current_balance - $amount;
        $this->save();

        PettyCashTransaction::create([
            'tenant_id'        => $this->tenant_id,
            'fund_id'          => $this->id,
            'type'             => 'expense',
            'amount'           => $amount,
            'description'      => $description,
            'transaction_date' => $date,
            'category'         => $category,
            'created_by'       => $userId,
        ]);
    }

    public function getIsLowBalanceAttribute(): bool
    {
        if ($this->authorized_amount <= 0) {
            return false;
        }

        return ($this->current_balance / $this->authorized_amount) < 0.2;
    }

    public function getUtilizationPercentAttribute(): float
    {
        if ($this->authorized_amount <= 0) {
            return 0.0;
        }

        $spent = $this->authorized_amount - $this->current_balance;

        return round(($spent / $this->authorized_amount) * 100, 1);
    }
}
