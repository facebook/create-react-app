<?php

namespace App\Modules\Purchase\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseVendor extends Model
{
    use BelongsToTenant;

    protected $table = 'po_vendors';

    protected $fillable = [
        'tenant_id',
        'name',
        'email',
        'phone',
        'address',
        'currency',
        'payment_terms',
        'is_active',
        'rating',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'rating'    => 'integer',
    ];

    public function rfqs(): HasMany
    {
        return $this->hasMany(PurchaseRfq::class, 'po_vendor_id');
    }

    public function pos(): HasMany
    {
        return $this->hasMany(Po::class, 'po_vendor_id');
    }
}
