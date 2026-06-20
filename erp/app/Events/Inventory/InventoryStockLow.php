<?php

namespace App\Events\Inventory;

use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\StockLevel;
use App\Modules\Inventory\Models\ReorderRule;

class InventoryStockLow
{
    public function __construct(
        public readonly Product $product,
        public readonly StockLevel $stockLevel,
        public readonly ReorderRule $reorderRule,
    ) {}
}
