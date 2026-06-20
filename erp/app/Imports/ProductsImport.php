<?php

namespace App\Imports;

use App\Modules\Inventory\Models\Product;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\SkipsErrors;

class ProductsImport implements ToModel, WithHeadingRow, SkipsOnError
{
    use SkipsErrors;

    public function __construct(private readonly int $tenantId) {}

    public function model(array $row): ?Product
    {
        return new Product([
            'tenant_id' => $this->tenantId,
            'sku'       => $row['sku'] ?? null,
            'name'      => $row['name'] ?? null,
        ]);
    }
}
