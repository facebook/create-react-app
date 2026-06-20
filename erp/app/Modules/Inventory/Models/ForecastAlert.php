<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ForecastAlert extends Model
{
    use BelongsToTenant;

    protected $table = 'forecast_alerts';

    protected $fillable = [
        'tenant_id',
        'product_id',
        'alert_type',
        'severity',
        'message',
        'is_resolved',
        'resolved_at',
    ];

    protected $casts = [
        'is_resolved' => 'boolean',
        'resolved_at' => 'datetime',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function resolve(): void
    {
        $this->is_resolved = true;
        $this->resolved_at = now();
        $this->save();
    }

    public function scopeUnresolved($query)
    {
        return $query->where('is_resolved', false);
    }
}
