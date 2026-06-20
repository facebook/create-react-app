<?php

namespace App\Modules\Maintenance\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Equipment extends Model
{
    use BelongsToTenant;

    protected $table = 'equipment';

    protected $fillable = [
        'tenant_id', 'name', 'code', 'category', 'location',
        'serial_number', 'manufacturer', 'model',
        'purchase_date', 'warranty_expiry', 'status', 'notes', 'assigned_to',
    ];

    protected $casts = [
        'purchase_date'   => 'date',
        'warranty_expiry' => 'date',
    ];

    public function plans(): HasMany
    {
        return $this->hasMany(MaintenancePlan::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(MaintenanceOrder::class);
    }

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function isWarrantyExpired(): bool
    {
        return $this->warranty_expiry && $this->warranty_expiry->isPast();
    }

    public function retire(): void
    {
        $this->update(['status' => 'retired']);
    }

    public function openOrdersCount(): int
    {
        return $this->orders()->whereIn('status', ['open', 'in_progress'])->count();
    }
}
