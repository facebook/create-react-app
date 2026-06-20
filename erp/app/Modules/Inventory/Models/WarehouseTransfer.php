<?php

namespace App\Modules\Inventory\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class WarehouseTransfer extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'product_id', 'from_warehouse_id', 'to_warehouse_id',
        'quantity', 'reference', 'notes', 'status', 'created_by',
    ];

    protected $casts = [
        'quantity' => 'float',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function fromWarehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'from_warehouse_id');
    }

    public function toWarehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'to_warehouse_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public static function execute(array $data): static
    {
        return DB::transaction(function () use ($data) {
            // Record OUT from source warehouse
            StockMovement::record([
                'product_id'   => $data['product_id'],
                'warehouse_id' => $data['from_warehouse_id'],
                'type'         => 'out',
                'quantity'     => $data['quantity'],
                'reference'    => $data['reference'] ?? null,
                'notes'        => $data['notes'] ?? null,
            ]);

            // Record IN to destination warehouse
            StockMovement::record([
                'product_id'   => $data['product_id'],
                'warehouse_id' => $data['to_warehouse_id'],
                'type'         => 'in',
                'quantity'     => $data['quantity'],
                'reference'    => $data['reference'] ?? null,
                'notes'        => $data['notes'] ?? null,
            ]);

            // Create the transfer record
            return static::create([
                'tenant_id'         => $data['tenant_id'],
                'product_id'        => $data['product_id'],
                'from_warehouse_id' => $data['from_warehouse_id'],
                'to_warehouse_id'   => $data['to_warehouse_id'],
                'quantity'          => $data['quantity'],
                'reference'         => $data['reference'] ?? null,
                'notes'             => $data['notes'] ?? null,
                'status'            => 'completed',
                'created_by'        => Auth::id(),
            ]);
        });
    }
}
