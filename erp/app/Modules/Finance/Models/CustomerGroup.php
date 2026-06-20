<?php

namespace App\Modules\Finance\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CustomerGroup extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id', 'name', 'description', 'discount_percent',
        'credit_limit', 'payment_term_id', 'currency', 'is_active',
    ];

    protected $casts = [
        'discount_percent' => 'float',
        'credit_limit'     => 'float',
        'is_active'        => 'boolean',
    ];

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(
            Contact::class,
            'customer_group_members',
            'customer_group_id',
            'contact_id'
        )->withTimestamps();
    }

    public function paymentTerm(): BelongsTo
    {
        return $this->belongsTo(PaymentTerm::class);
    }

    public function getMemberCountAttribute(): int
    {
        return $this->members()->count();
    }

    public function getHasDiscountAttribute(): bool
    {
        return $this->discount_percent > 0;
    }

    public function calculateDiscount(float $amount): float
    {
        return $amount * ($this->discount_percent / 100);
    }
}
