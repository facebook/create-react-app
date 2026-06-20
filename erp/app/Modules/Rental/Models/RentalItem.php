<?php

namespace App\Modules\Rental\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class RentalItem extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'name',
        'description',
        'category',
        'daily_rate',
        'status',
        'serial_number',
    ];

    public function agreements(): HasMany
    {
        return $this->hasMany(RentalAgreement::class, 'rental_item_id');
    }

    public function currentAgreement(): HasOne
    {
        return $this->hasOne(RentalAgreement::class, 'rental_item_id')
            ->where('status', 'active')
            ->latestOfMany();
    }

    public function isAvailable(): bool
    {
        return $this->status === 'available';
    }
}
