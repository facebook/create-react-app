<?php

namespace App\Modules\Finance\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaxGroupItem extends Model
{
    use BelongsToTenant;

    protected $table = 'tax_group_items';

    protected $fillable = [
        'tenant_id', 'tax_group_id', 'tax_rate_id',
    ];

    public function taxGroup(): BelongsTo
    {
        return $this->belongsTo(TaxGroup::class);
    }

    public function taxRate(): BelongsTo
    {
        return $this->belongsTo(TaxRate::class);
    }
}
