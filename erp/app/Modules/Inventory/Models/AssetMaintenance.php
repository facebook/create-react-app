<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class AssetMaintenance extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id', 'asset_id', 'scheduled_date', 'completed_date',
        'type', 'description', 'cost', 'performed_by', 'status',
    ];

    protected $casts = [
        'scheduled_date'  => 'date',
        'completed_date'  => 'date',
        'cost'            => 'decimal:2',
    ];

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function complete(string $completedDate, ?float $cost = null): void
    {
        $this->status = 'completed';
        $this->completed_date = $completedDate;
        if ($cost !== null) {
            $this->cost = $cost;
        }
        $this->save();
    }
}
