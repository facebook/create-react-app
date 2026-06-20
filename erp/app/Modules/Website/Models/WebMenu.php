<?php

namespace App\Modules\Website\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class WebMenu extends Model
{
    use BelongsToTenant;

    protected $table = 'web_menus';

    protected $fillable = [
        'tenant_id',
        'name',
        'location',
        'items',
        'is_active',
    ];

    protected $casts = [
        'items'     => 'array',
        'is_active' => 'boolean',
    ];
}
