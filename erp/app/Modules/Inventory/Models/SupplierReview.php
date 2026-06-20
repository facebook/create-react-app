<?php

namespace App\Modules\Inventory\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupplierReview extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'supplier_id',
        'purchase_order_id',
        'review_date',
        'quality_score',
        'delivery_score',
        'communication_score',
        'price_score',
        'notes',
        'reviewed_by',
    ];

    protected $casts = [
        'review_date'          => 'date',
        'quality_score'        => 'integer',
        'delivery_score'       => 'integer',
        'communication_score'  => 'integer',
        'price_score'          => 'integer',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function getOverallScoreAttribute(): float
    {
        $avg = ($this->quality_score + $this->delivery_score + $this->communication_score + $this->price_score) / 4;
        return round($avg, 1);
    }
}
