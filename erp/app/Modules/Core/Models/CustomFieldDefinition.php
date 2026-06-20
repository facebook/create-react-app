<?php

namespace App\Modules\Core\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CustomFieldDefinition extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'model_type',
        'field_name',
        'field_key',
        'field_type',
        'options',
        'required',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'options'    => 'array',
        'required'   => 'boolean',
        'is_active'  => 'boolean',
        'sort_order' => 'integer',
    ];

    public function values(): HasMany
    {
        return $this->hasMany(CustomFieldValue::class, 'definition_id');
    }
}
