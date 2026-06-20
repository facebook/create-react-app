<?php

namespace Database\Seeders;

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\ProductCategory;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\StockLevel;
use App\Modules\Inventory\Models\Supplier;
use App\Modules\Inventory\Models\UnitOfMeasure;
use App\Modules\Inventory\Models\Warehouse;
use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();

        if (! $tenant) {
            return;
        }

        // Warehouses
        $main = Warehouse::create(['tenant_id' => $tenant->id, 'name' => 'Main Warehouse',   'location' => 'Building A, Floor 1']);
        $secondary = Warehouse::create(['tenant_id' => $tenant->id, 'name' => 'Secondary Store', 'location' => 'Building B']);
        $returns = Warehouse::create(['tenant_id' => $tenant->id, 'name' => 'Returns Depot',    'location' => 'Dock C',          'is_active' => false]);

        // Units of Measure
        $pcs  = UnitOfMeasure::create(['tenant_id' => $tenant->id, 'name' => 'Pieces',    'abbreviation' => 'pcs']);
        $kg   = UnitOfMeasure::create(['tenant_id' => $tenant->id, 'name' => 'Kilograms', 'abbreviation' => 'kg']);
        $ltr  = UnitOfMeasure::create(['tenant_id' => $tenant->id, 'name' => 'Litres',    'abbreviation' => 'ltr']);

        // Categories
        $electronics = ProductCategory::create(['tenant_id' => $tenant->id, 'name' => 'Electronics',     'slug' => 'electronics']);
        $computers   = ProductCategory::create(['tenant_id' => $tenant->id, 'name' => 'Computers',       'slug' => 'computers']);
        $peripherals = ProductCategory::create(['tenant_id' => $tenant->id, 'name' => 'Peripherals',     'slug' => 'peripherals']);
        $office      = ProductCategory::create(['tenant_id' => $tenant->id, 'name' => 'Office Supplies', 'slug' => 'office-supplies']);
        $consumables = ProductCategory::create(['tenant_id' => $tenant->id, 'name' => 'Consumables',     'slug' => 'consumables']);

        // Suppliers
        $supplier1 = Supplier::create(['tenant_id' => $tenant->id, 'name' => 'TechWorld Distributors', 'contact_person' => 'Alice Nguyen',  'email' => 'alice@techworld.example', 'phone' => '+1-555-0100']);
        $supplier2 = Supplier::create(['tenant_id' => $tenant->id, 'name' => 'Office Direct',          'contact_person' => 'Bob Martinez',  'email' => 'bob@officedirect.example','phone' => '+1-555-0200']);

        // Products & Stock
        $products = [
            ['sku' => 'LAP-001', 'name' => 'Laptop Pro 15"',    'category_id' => $computers->id,   'uom_id' => $pcs->id,  'cost_price' => 850.00, 'sale_price' => 1299.99, 'reorder_point' => 5],
            ['sku' => 'LAP-002', 'name' => 'Laptop Air 13"',    'category_id' => $computers->id,   'uom_id' => $pcs->id,  'cost_price' => 650.00, 'sale_price' => 999.99,  'reorder_point' => 5],
            ['sku' => 'MON-001', 'name' => '27" Monitor 4K',    'category_id' => $peripherals->id, 'uom_id' => $pcs->id,  'cost_price' => 280.00, 'sale_price' => 449.99,  'reorder_point' => 3],
            ['sku' => 'KBD-001', 'name' => 'Mechanical Keyboard','category_id' => $peripherals->id,'uom_id' => $pcs->id,  'cost_price' => 60.00,  'sale_price' => 119.99,  'reorder_point' => 10],
            ['sku' => 'MSE-001', 'name' => 'Wireless Mouse',    'category_id' => $peripherals->id, 'uom_id' => $pcs->id,  'cost_price' => 25.00,  'sale_price' => 49.99,   'reorder_point' => 10],
            ['sku' => 'PPR-A4',  'name' => 'A4 Paper Ream',     'category_id' => $office->id,      'uom_id' => $pcs->id,  'cost_price' => 4.50,   'sale_price' => 8.99,    'reorder_point' => 50],
            ['sku' => 'PEN-BLK', 'name' => 'Ballpoint Pen Box', 'category_id' => $office->id,      'uom_id' => $pcs->id,  'cost_price' => 3.00,   'sale_price' => 6.50,    'reorder_point' => 20],
        ];

        foreach ($products as $data) {
            $product = Product::create([...$data, 'tenant_id' => $tenant->id]);

            StockLevel::create([
                'tenant_id'    => $tenant->id,
                'product_id'   => $product->id,
                'warehouse_id' => $main->id,
                'quantity'     => rand(10, 100),
            ]);
        }
    }
}
