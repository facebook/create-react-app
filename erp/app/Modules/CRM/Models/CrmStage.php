<?php

namespace App\Modules\CRM\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CrmStage extends Model
{
    use BelongsToTenant;

    protected $table = 'crm_stages';

    protected $fillable = ['tenant_id', 'name', 'sequence', 'type', 'probability', 'color', 'is_active'];

    protected $casts = [
        'probability' => 'float',
        'sequence'    => 'integer',
        'is_active'   => 'boolean',
    ];

    protected $attributes = [
        'type'        => 'open',
        'probability' => 0,
        'sequence'    => 10,
        'is_active'   => true,
    ];

    public function leads(): HasMany
    {
        return $this->hasMany(CrmLead::class, 'stage_id');
    }
}
