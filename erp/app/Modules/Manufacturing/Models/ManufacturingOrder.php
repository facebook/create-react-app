<?php

namespace App\Modules\Manufacturing\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\Warehouse;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ManufacturingOrder extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $table = 'manufacturing_orders';

    protected $fillable = [
        'tenant_id', 'mo_number', 'product_id', 'bom_id',
        'qty_to_produce', 'qty_produced', 'status',
        'scheduled_date', 'start_date', 'finish_date',
        'warehouse_id', 'origin', 'notes', 'created_by', 'responsible_id',
    ];

    protected $casts = [
        'qty_to_produce' => 'float',
        'qty_produced'   => 'float',
        'scheduled_date' => 'date',
        'start_date'     => 'date',
        'finish_date'    => 'date',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function bom(): BelongsTo
    {
        return $this->belongsTo(BillOfMaterials::class, 'bom_id');
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function responsible(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responsible_id');
    }

    public function components(): HasMany
    {
        return $this->hasMany(MoComponent::class);
    }

    public function workOrders(): HasMany
    {
        return $this->hasMany(WorkOrder::class)->orderBy('sequence');
    }

    public function confirm(): void
    {
        if (is_null($this->mo_number)) {
            $this->mo_number = $this->generateMoNumber();
        }
        $this->status = 'confirmed';
        $this->save();
    }

    public function startProduction(): void
    {
        $this->status     = 'in_progress';
        $this->start_date = now()->toDateString();
        $this->save();
    }

    public function complete(float $qtyProduced = 0): void
    {
        $this->status       = 'done';
        $this->qty_produced = $qtyProduced > 0 ? $qtyProduced : $this->qty_to_produce;
        $this->finish_date  = now()->toDateString();
        $this->save();
        event(new \App\Events\Manufacturing\ManufacturingOrderCompleted($this));
    }

    public function cancel(): void
    {
        $this->status = 'cancelled';
        $this->save();
    }

    public function generateMoNumber(): string
    {
        return 'MO-' . date('Y') . '-' . str_pad($this->id, 5, '0', STR_PAD_LEFT);
    }

    protected function isDraft(): Attribute
    {
        return Attribute::make(get: fn () => $this->status === 'draft');
    }

    protected function isConfirmed(): Attribute
    {
        return Attribute::make(get: fn () => $this->status === 'confirmed');
    }

    protected function isInProgress(): Attribute
    {
        return Attribute::make(get: fn () => $this->status === 'in_progress');
    }

    protected function isDone(): Attribute
    {
        return Attribute::make(get: fn () => $this->status === 'done');
    }

    protected function progressPercentage(): Attribute
    {
        return Attribute::make(get: function () {
            if ($this->qty_to_produce <= 0) {
                return 0;
            }
            return round(($this->qty_produced / $this->qty_to_produce) * 100, 2);
        });
    }

    public static function fromBom(BillOfMaterials $bom, float $qty, int $tenantId): self
    {
        $mo = self::create([
            'tenant_id'      => $tenantId,
            'product_id'     => $bom->product_id,
            'bom_id'         => $bom->id,
            'qty_to_produce' => $qty,
            'status'         => 'draft',
        ]);

        $scaleFactor = $qty / max($bom->qty_per_bom, 1);

        foreach ($bom->lines as $line) {
            $mo->components()->create([
                'product_id'   => $line->component_id,
                'qty_required' => $line->quantity * $scaleFactor,
                'uom'          => $line->uom,
            ]);
        }

        return $mo;
    }
}
