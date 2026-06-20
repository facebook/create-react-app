<?php

namespace App\Modules\Lunch\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LunchSupplier extends Model
{
    use BelongsToTenant;

    protected $table = 'lunch_suppliers';

    protected $fillable = [
        'tenant_id',
        'name',
        'address',
        'phone',
        'email',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function products(): HasMany
    {
        return $this->hasMany(LunchProduct::class);
    }
}
