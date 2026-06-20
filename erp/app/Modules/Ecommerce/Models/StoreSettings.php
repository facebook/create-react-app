<?php

namespace App\Modules\Ecommerce\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class StoreSettings extends Model
{
    use BelongsToTenant;

    protected $table = 'store_settings';

    protected $fillable = [
        'tenant_id',
        'store_name',
        'store_slug',
        'description',
        'currency_code',
        'is_active',
        'logo_path',
        'primary_color',
        'allow_guest_checkout',
    ];

    protected $casts = [
        'is_active'             => 'boolean',
        'allow_guest_checkout'  => 'boolean',
    ];
}
