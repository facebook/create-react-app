<?php

namespace App\Modules\Finance\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoyaltyTransaction extends Model
{
    use BelongsToTenant;

    protected $table = 'loyalty_transactions';

    protected $fillable = [
        'tenant_id',
        'loyalty_enrollment_id',
        'type',
        'points',
        'description',
        'reference_id',
        'balance_after',
    ];

    protected $casts = [
        'points'       => 'integer',
        'balance_after' => 'integer',
    ];

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(LoyaltyEnrollment::class, 'loyalty_enrollment_id');
    }
}
