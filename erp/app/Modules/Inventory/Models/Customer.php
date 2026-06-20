<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $table = 'contacts';

    protected $fillable = [
        'tenant_id', 'name', 'email', 'phone', 'address', 'notes', 'is_active',
    ];
}
