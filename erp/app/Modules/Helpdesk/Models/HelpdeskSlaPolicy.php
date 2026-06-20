<?php

namespace App\Modules\Helpdesk\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class HelpdeskSlaPolicy extends Model
{
    use BelongsToTenant;

    protected $table = 'helpdesk_sla_policies';

    protected $fillable = [
        'tenant_id',
        'name',
        'priority',
        'response_hours',
        'resolution_hours',
        'is_active',
    ];

    protected $casts = [
        'response_hours'   => 'integer',
        'resolution_hours' => 'integer',
        'is_active'        => 'boolean',
    ];
}
