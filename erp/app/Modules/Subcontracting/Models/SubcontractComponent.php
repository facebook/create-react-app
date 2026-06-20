<?php

namespace App\Modules\Subcontracting\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubcontractComponent extends Model
{
    use BelongsToTenant;

    protected $table = 'subcontract_components';

    protected $fillable = [
        'subcontract_id',
        'tenant_id',
        'component_name',
        'quantity',
        'unit',
    ];

    protected $casts = [
        'quantity' => 'float',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(SubcontractOrder::class, 'subcontract_id');
    }
}
