<?php

namespace Database\Seeders;

use App\Modules\Core\Models\Tenant;
use App\Modules\Lunch\Models\LunchOrder;
use App\Modules\Lunch\Models\LunchProduct;
use App\Modules\Lunch\Models\LunchSupplier;
use Illuminate\Database\Seeder;

class LunchSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();

        if (! $tenant) {
            return;
        }

        $userId = \App\Models\User::first()->id ?? 1;

        $supplier = LunchSupplier::create([
            'tenant_id'   => $tenant->id,
            'name'        => 'Fresh Bites Catering',
            'address'     => '22 Market Street, Downtown',
            'phone'       => '+1-555-0760',
            'email'       => 'orders@freshbites.example',
            'description' => 'Daily hot meals and healthy lunch boxes delivered to your office.',
            'is_active'   => true,
        ]);

        $sandwich = LunchProduct::create([
            'tenant_id'        => $tenant->id,
            'lunch_supplier_id' => $supplier->id,
            'name'             => 'Club Sandwich Meal',
            'description'      => 'Turkey club sandwich with fries and a soft drink.',
            'price'            => 12.50,
            'category'         => 'sandwiches',
            'is_available'     => true,
        ]);

        $pasta = LunchProduct::create([
            'tenant_id'        => $tenant->id,
            'lunch_supplier_id' => $supplier->id,
            'name'             => 'Grilled Chicken Pasta',
            'description'      => 'Penne pasta with grilled chicken, cherry tomatoes, and pesto sauce.',
            'price'            => 14.00,
            'category'         => 'hot meals',
            'is_available'     => true,
        ]);

        LunchProduct::create([
            'tenant_id'        => $tenant->id,
            'lunch_supplier_id' => $supplier->id,
            'name'             => 'Caesar Salad Bowl',
            'description'      => 'Fresh romaine lettuce, croutons, parmesan, and Caesar dressing.',
            'price'            => 10.00,
            'category'         => 'salads',
            'is_available'     => true,
        ]);

        LunchOrder::create([
            'tenant_id'        => $tenant->id,
            'employee_id'      => $userId,
            'lunch_product_id' => $sandwich->id,
            'quantity'         => 1,
            'order_date'       => now()->toDateString(),
            'status'           => 'confirmed',
            'total_price'      => 12.50,
        ]);

        LunchOrder::create([
            'tenant_id'        => $tenant->id,
            'employee_id'      => $userId,
            'lunch_product_id' => $pasta->id,
            'quantity'         => 2,
            'order_date'       => now()->toDateString(),
            'status'           => 'pending',
            'notes'            => 'Extra sauce on the side please.',
            'total_price'      => 28.00,
        ]);
    }
}
