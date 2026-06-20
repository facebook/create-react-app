<?php

namespace App\Modules\Finance\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use App\Modules\Core\Traits\HasAuditLog;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Contact extends Model
{
    use BelongsToTenant;
    use HasAuditLog;
    use LogsActivity;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id', 'name', 'email', 'phone',
        'address', 'type', 'price_list_id', 'notes', 'is_active',
        'credit_limit', 'credit_terms_days', 'credit_hold',
    ];

    protected $casts = [
        'is_active'         => 'boolean',
        'credit_hold'       => 'boolean',
        'credit_limit'      => 'decimal:2',
        'credit_terms_days' => 'integer',
    ];

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function bills(): HasMany
    {
        return $this->hasMany(Bill::class);
    }

    public function priceList(): BelongsTo
    {
        return $this->belongsTo(PriceList::class);
    }

    public function vendorProfile(): HasOne
    {
        return $this->hasOne(VendorProfile::class);
    }

    public function vendorEvaluations(): HasMany
    {
        return $this->hasMany(VendorEvaluation::class)->latest('evaluation_date');
    }

    public function scopeCustomers($query)
    {
        return $query->whereIn('type', ['customer', 'both']);
    }

    public function scopeVendors($query)
    {
        return $query->whereIn('type', ['vendor', 'both']);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
              ->orWhere('email', 'like', "%{$term}%");
        });
    }
}
