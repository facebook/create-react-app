<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Modules\Inventory\Models\Warehouse;
use App\Modules\Inventory\Models\WarehouseStock;
use Inertia\Inertia;
use Inertia\Response;

class MultiWarehouseController
{
    public function index(): Response
    {
        $tenantId = auth()->user()->tenant_id;

        $warehouses = Warehouse::where('tenant_id', $tenantId)
            ->withCount([
                'warehouseStock as product_count' => fn($q) => $q->where('quantity', '>', 0),
            ])
            ->orderBy('name')
            ->get()
            ->map(fn($w) => [
                'id'             => $w->id,
                'name'           => $w->name,
                'address'        => $w->address ?? null,
                'city'           => $w->city ?? null,
                'country'        => $w->country ?? null,
                'costing_method' => $w->costing_method ?? 'average',
                'is_active'      => $w->is_active ?? true,
                'product_count'  => $w->product_count,
            ]);

        $summary = [
            'total_warehouses'  => $warehouses->count(),
            'active_warehouses' => $warehouses->where('is_active', true)->count(),
            'total_products'    => WarehouseStock::where('tenant_id', $tenantId)->where('quantity', '>', 0)->distinct('product_id')->count('product_id'),
        ];

        return Inertia::render('Inventory/MultiWarehouse/Index', [
            'warehouses' => $warehouses->values(),
            'summary'    => $summary,
        ]);
    }
}
