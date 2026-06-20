<?php

namespace App\Modules\Finance\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PettyCashTransaction extends Model
{
    protected $fillable = [
        'tenant_id',
        'fund_id',
        'type',
        'amount',
        'description',
        'transaction_date',
        'reference',
        'category',
        'created_by',
    ];

    protected $casts = [
        'amount'           => 'float',
        'transaction_date' => 'date',
    ];

    public function fund(): BelongsTo
    {
        return $this->belongsTo(PettyCashFund::class, 'fund_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getIsDebitAttribute(): bool
    {
        return $this->type === 'expense' || $this->type === 'advance';
    }
}
