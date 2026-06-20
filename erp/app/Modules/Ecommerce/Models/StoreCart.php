<?php

namespace App\Modules\Ecommerce\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StoreCart extends Model
{
    protected $table = 'store_carts';

    protected $fillable = [
        'tenant_id',
        'session_key',
        'store_product_id',
        'quantity',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(StoreProduct::class, 'store_product_id');
    }

    public static function getOrCreateForSession(string $sessionKey): Collection
    {
        return static::where('session_key', $sessionKey)->with('product.product')->get();
    }
}
