<?php

namespace App\Modules\Finance\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class TaxRate extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $table = 'tax_rates';

    protected $fillable = [
        'tenant_id', 'name', 'rate', 'tax_type',
        'is_compound', 'is_active', 'account_id',
    ];

    protected $casts = [
        'rate'        => 'decimal:4',
        'is_compound' => 'boolean',
        'is_active'   => 'boolean',
    ];

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function taxGroupItems(): HasMany
    {
        return $this->hasMany(TaxGroupItem::class);
    }

    public function calculateTax(float $amount): float
    {
        return round($amount * $this->rate / 100, 4);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForSales($query)
    {
        return $query->whereIn('tax_type', ['sales', 'both']);
    }

    public function scopeForPurchase($query)
    {
        return $query->whereIn('tax_type', ['purchase', 'both']);
    }
}
