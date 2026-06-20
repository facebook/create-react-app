<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use App\Modules\Core\Traits\HasAuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends Model
{
    use BelongsToTenant;
    use HasAuditLog;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id', 'name', 'contact_person',
        'email', 'phone', 'address', 'is_active',
    ];

    protected $casts = ['is_active' => 'boolean'];

    public function purchaseOrders(): HasMany
    {
        return $this->hasMany(PurchaseOrder::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(SupplierReview::class);
    }

    public function contracts(): HasMany
    {
        return $this->hasMany(SupplierContract::class);
    }

    public function getAverageRatingAttribute(): ?float
    {
        if ($this->reviews->isEmpty()) {
            return null;
        }

        $avg = $this->reviews->map(fn ($r) =>
            ($r->quality_score + $r->delivery_score + $r->communication_score + $r->price_score) / 4
        )->avg();

        return $avg !== null ? round($avg, 1) : null;
    }

    public function getActiveContractAttribute(): ?SupplierContract
    {
        return $this->contracts->firstWhere('status', 'active');
    }
}
