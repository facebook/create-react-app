<?php

namespace App\Modules\Finance\Models;

use App\Modules\Inventory\Models\Product;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorBillItem extends Model
{
    protected $fillable = [
        'tenant_id',
        'vendor_bill_id',
        'product_id',
        'description',
        'quantity',
        'unit_price',
    ];

    protected $casts = [
        'quantity'   => 'float',
        'unit_price' => 'float',
    ];

    public function vendorBill(): BelongsTo
    {
        return $this->belongsTo(VendorBill::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function getLineTotalAttribute(): float
    {
        return $this->quantity * $this->unit_price;
    }
}
