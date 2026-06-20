<?php

namespace App\Modules\Finance\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class ContractRenewal extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'contract_id', 'new_end_date', 'new_value', 'notes', 'renewed_by',
    ];

    protected $casts = [
        'new_end_date' => 'date',
        'new_value'    => 'float',
    ];

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    public function renewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'renewed_by');
    }
}
