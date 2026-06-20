<?php

namespace App\Modules\Ecommerce\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StoreReview extends Model
{
    use BelongsToTenant;

    protected $table = 'store_reviews';

    protected $fillable = [
        'tenant_id',
        'store_product_id',
        'order_id',
        'reviewer_name',
        'reviewer_email',
        'rating',
        'title',
        'body',
        'is_approved',
    ];

    protected $casts = [
        'is_approved' => 'boolean',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(StoreProduct::class, 'store_product_id');
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(StoreOrder::class, 'order_id');
    }

    public function approve(): void
    {
        $this->is_approved = true;
        $this->save();
    }
}
