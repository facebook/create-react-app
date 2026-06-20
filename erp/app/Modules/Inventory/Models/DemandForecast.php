<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DemandForecast extends Model
{
    use BelongsToTenant;

    protected $table = 'demand_forecasts';

    protected $fillable = [
        'tenant_id',
        'product_id',
        'warehouse_id',
        'forecast_date',
        'forecasted_quantity',
        'actual_quantity',
        'method',
        'confidence_score',
        'notes',
    ];

    protected $casts = [
        'forecast_date'       => 'date',
        'forecasted_quantity' => 'decimal:2',
        'actual_quantity'     => 'decimal:2',
        'confidence_score'    => 'decimal:2',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function getAccuracyAttribute(): ?float
    {
        if ($this->actual_quantity === null) {
            return null;
        }

        if ((float) $this->forecasted_quantity <= 0) {
            return null;
        }

        $accuracy = 100 - abs((float) $this->actual_quantity - (float) $this->forecasted_quantity) / (float) $this->forecasted_quantity * 100;

        return (float) round(max(0, $accuracy), 1);
    }

    public static function generateMovingAvg(int $tenantId, int $productId, int $periods = 3): float
    {
        $records = static::where('tenant_id', $tenantId)
            ->where('product_id', $productId)
            ->whereNotNull('actual_quantity')
            ->orderByDesc('forecast_date')
            ->take($periods)
            ->get();

        if ($records->isEmpty()) {
            return 0.0;
        }

        return (float) $records->avg('actual_quantity');
    }
}
