<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class StockMovement extends Model
{
    use BelongsToTenant;

    public const UPDATED_AT = null;

    protected $fillable = [
        'tenant_id', 'product_id', 'warehouse_id',
        'type', 'quantity', 'reference', 'notes', 'created_by',
        'lot_id', 'serial_id',
    ];

    protected $casts = ['quantity' => 'decimal:2'];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function lot(): BelongsTo
    {
        return $this->belongsTo(LotNumber::class, 'lot_id');
    }

    public function serial(): BelongsTo
    {
        return $this->belongsTo(SerialNumber::class, 'serial_id');
    }

    /**
     * Record a stock movement and update StockLevel atomically.
     *
     * @param array{product_id:int, warehouse_id:int, type:string, quantity:float, reference?:string, notes?:string} $data
     */
    public static function record(array $data): self
    {
        return DB::transaction(function () use ($data) {
            $tenantId = app()->has('tenant') ? app('tenant')->id : null;

            $level = StockLevel::firstOrCreate(
                ['product_id' => $data['product_id'], 'warehouse_id' => $data['warehouse_id']],
                ['tenant_id' => $tenantId, 'quantity' => 0, 'reserved_quantity' => 0],
            );

            $qty = (float) $data['quantity'];

            match ($data['type']) {
                'in'         => $level->increment('quantity', $qty),
                'out'        => self::deductStock($level, $qty),
                'adjustment' => self::adjustStock($level, $qty),
                default      => null,
            };

            return self::create([
                ...$data,
                'tenant_id'  => $tenantId,
                'created_by' => Auth::id(),
                'quantity'   => $qty,
            ]);
        });
    }

    private static function deductStock(StockLevel $level, float $qty): void
    {
        $available = (float) $level->quantity - (float) $level->reserved_quantity;

        if ($qty > $available) {
            throw new \DomainException(
                "Insufficient stock. Available: {$available}, requested: {$qty}."
            );
        }

        $level->decrement('quantity', $qty);
    }

    private static function adjustStock(StockLevel $level, float $newQty): void
    {
        $level->update(['quantity' => max(0, $newQty)]);
    }
}
