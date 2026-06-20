<?php

namespace Database\Seeders;

use App\Modules\Core\Models\Tenant;
use App\Modules\Ecommerce\Models\StoreOrder;
use App\Modules\Ecommerce\Models\StoreProduct;
use App\Modules\Inventory\Models\Product;
use Illuminate\Database\Seeder;

class EcommerceSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();

        if (! $tenant) {
            return;
        }

        // Resolve inventory products created by InventorySeeder (by SKU).
        $laptop   = Product::where('tenant_id', $tenant->id)->where('sku', 'LAP-001')->first();
        $monitor  = Product::where('tenant_id', $tenant->id)->where('sku', 'MON-001')->first();
        $keyboard = Product::where('tenant_id', $tenant->id)->where('sku', 'KBD-001')->first();

        // Fall back to any available products if InventorySeeder hasn't run yet.
        if (! $laptop || ! $monitor || ! $keyboard) {
            $products = Product::where('tenant_id', $tenant->id)->take(3)->get();
            if ($products->count() < 3) {
                return;
            }
            [$laptop, $monitor, $keyboard] = [$products[0], $products[1], $products[2]];
        }

        // Store Products
        $sp1 = StoreProduct::create([
            'tenant_id'         => $tenant->id,
            'product_id'        => $laptop->id,
            'store_price'       => 1299.99,
            'compare_price'     => 1499.99,
            'is_featured'       => true,
            'is_visible'        => true,
            'sort_order'        => 1,
            'short_description' => 'Powerful 15-inch laptop for professionals.',
            'meta_title'        => 'Laptop Pro 15" | Best Performance Laptop',
        ]);

        $sp2 = StoreProduct::create([
            'tenant_id'         => $tenant->id,
            'product_id'        => $monitor->id,
            'store_price'       => 449.99,
            'is_featured'       => false,
            'is_visible'        => true,
            'sort_order'        => 2,
            'short_description' => 'Crystal-clear 27-inch 4K display for home and office.',
            'meta_title'        => '27" 4K Monitor | Ultra HD Display',
        ]);

        $sp3 = StoreProduct::create([
            'tenant_id'         => $tenant->id,
            'product_id'        => $keyboard->id,
            'store_price'       => 119.99,
            'compare_price'     => 139.99,
            'is_featured'       => false,
            'is_visible'        => true,
            'sort_order'        => 3,
            'short_description' => 'Tactile mechanical keyboard for fast typists.',
            'meta_title'        => 'Mechanical Keyboard | Tactile Typing',
        ]);

        // Store Orders
        StoreOrder::create([
            'tenant_id'        => $tenant->id,
            'order_number'     => 'SO-2026-00001',
            'status'           => 'delivered',
            'customer_name'    => 'Emma Clarke',
            'customer_email'   => 'emma.clarke@example.com',
            'customer_phone'   => '+1-555-0501',
            'shipping_address' => '42 Elm Street, Springfield, IL 62701',
            'billing_address'  => '42 Elm Street, Springfield, IL 62701',
            'subtotal'         => 1299.99,
            'discount_amount'  => 0.00,
            'shipping_amount'  => 9.99,
            'tax_amount'       => 104.00,
            'total'            => 1413.98,
            'payment_method'   => 'credit_card',
            'payment_status'   => 'paid',
        ]);

        StoreOrder::create([
            'tenant_id'        => $tenant->id,
            'order_number'     => 'SO-2026-00002',
            'status'           => 'processing',
            'customer_name'    => 'James Patel',
            'customer_email'   => 'james.patel@example.com',
            'shipping_address' => '18 Oak Avenue, Austin, TX 78701',
            'billing_address'  => '18 Oak Avenue, Austin, TX 78701',
            'subtotal'         => 569.98,
            'discount_amount'  => 50.00,
            'shipping_amount'  => 0.00,
            'tax_amount'       => 41.60,
            'total'            => 561.58,
            'payment_method'   => 'bank_transfer',
            'payment_status'   => 'paid',
        ]);
    }
}
