<?php

namespace App\Exports;

use App\Modules\Inventory\Models\Product;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ProductsExport implements FromQuery, WithHeadings, WithMapping
{
    public function __construct(private readonly int $tenantId) {}

    public function query()
    {
        return Product::where('tenant_id', $this->tenantId);
    }

    public function headings(): array
    {
        return ['ID', 'SKU', 'Name', 'Cost Price', 'Sale Price', 'Type'];
    }

    public function map($product): array
    {
        return [
            $product->id,
            $product->sku,
            $product->name,
            $product->cost_price,
            $product->sale_price,
            $product->type ?? '',
        ];
    }
}
