<?php

namespace App\Modules\Manufacturing\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use App\Modules\Inventory\Models\Product;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class BillOfMaterials extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $table = 'bills_of_materials';

    protected $fillable = [
        'tenant_id', 'product_id', 'code', 'name', 'type',
        'qty_per_bom', 'uom', 'is_active', 'version', 'notes',
    ];

    protected $casts = [
        'qty_per_bom' => 'float',
        'is_active'   => 'boolean',
        'version'     => 'integer',
    ];

    protected $attributes = [
        'type'        => 'manufacture',
        'qty_per_bom' => 1,
        'is_active'   => true,
        'version'     => 1,
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function lines(): HasMany
    {
        return $this->hasMany(BomLine::class, 'bom_id')->orderBy('sequence');
    }

    protected function typeLabel(): Attribute
    {
        return Attribute::make(get: fn () => match ($this->type) {
            'kit'            => 'Kit',
            'subcontracting' => 'Subcontracting',
            default          => 'Manufacture',
        });
    }

    protected function componentCount(): Attribute
    {
        return Attribute::make(get: fn () => $this->lines()->count());
    }
}
