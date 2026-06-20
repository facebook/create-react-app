<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\Product;
use App\Modules\Manufacturing\Models\BillOfMaterials;
use App\Modules\Manufacturing\Models\BomLine;
use App\Modules\Manufacturing\Models\ManufacturingOrder;
use App\Modules\Manufacturing\Models\WorkCenter;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Mfg Co', 'slug' => 'mfg-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

function makeMfgProduct(?string $name = null): Product
{
    return Product::create([
        'tenant_id'  => test()->tenant->id,
        'name'       => $name ?? 'MFG Product ' . uniqid(),
        'sku'        => 'MFG-' . uniqid(),
        'sale_price' => 100.00,
        'cost_price' => 50.00,
        'is_active'  => true,
    ]);
}

function makeBom(Product $product): BillOfMaterials
{
    return BillOfMaterials::create([
        'tenant_id'   => test()->tenant->id,
        'product_id'  => $product->id,
        'name'        => 'BOM for ' . $product->name,
        'type'        => 'manufacture',
        'qty_per_bom' => 1,
        'is_active'   => true,
    ]);
}

// ── Bills of Materials ────────────────────────────────────────────────────────

test('can create a BOM with lines', function () {
    $product   = makeMfgProduct('Finished Good');
    $component = makeMfgProduct('Component');

    $this->withToken($this->token)
        ->postJson('/api/v1/mfg/boms', [
            'product_id'  => $product->id,
            'name'        => 'Standard BOM',
            'type'        => 'manufacture',
            'qty_per_bom' => 1,
            'lines'       => [
                ['component_id' => $component->id, 'quantity' => 2.0, 'sequence' => 10],
            ],
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.type', 'manufacture')
        ->assertJsonStructure(['data' => ['lines']]);
});

test('can list BOMs', function () {
    $product = makeMfgProduct();
    makeBom($product);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/mfg/boms')
        ->assertStatus(200);

    expect(count($response->json('data')))->toBeGreaterThanOrEqual(1);
});

test('can view a BOM with lines', function () {
    $product   = makeMfgProduct();
    $bom       = makeBom($product);
    $component = makeMfgProduct('Comp');

    BomLine::create([
        'bom_id'       => $bom->id,
        'component_id' => $component->id,
        'quantity'     => 3.0,
        'sequence'     => 10,
    ]);

    $this->withToken($this->token)
        ->getJson("/api/v1/mfg/boms/{$bom->id}")
        ->assertStatus(200)
        ->assertJsonStructure(['data' => ['id', 'name', 'lines']]);
});

test('can add a line to a BOM', function () {
    $product   = makeMfgProduct();
    $bom       = makeBom($product);
    $component = makeMfgProduct('New Comp');

    $this->withToken($this->token)
        ->postJson("/api/v1/mfg/boms/{$bom->id}/lines", [
            'component_id' => $component->id,
            'quantity'     => 5.0,
            'uom'          => 'pcs',
        ])
        ->assertStatus(201);

    expect((float) $this->withToken($this->token)->getJson("/api/v1/mfg/boms/{$bom->id}")->json('data.lines.0.quantity'))->toBe(5.0);
});

test('can remove a line from a BOM', function () {
    $product   = makeMfgProduct();
    $bom       = makeBom($product);
    $component = makeMfgProduct('Removable');

    $line = BomLine::create([
        'bom_id'       => $bom->id,
        'component_id' => $component->id,
        'quantity'     => 1.0,
    ]);

    $this->withToken($this->token)
        ->deleteJson("/api/v1/mfg/boms/{$bom->id}/lines/{$line->id}")
        ->assertStatus(200);

    expect(BomLine::find($line->id))->toBeNull();
});

// ── Manufacturing Orders ──────────────────────────────────────────────────────

test('can create a manufacturing order', function () {
    $product = makeMfgProduct();
    $bom     = makeBom($product);

    $this->withToken($this->token)
        ->postJson('/api/v1/mfg/orders', [
            'product_id'     => $product->id,
            'bom_id'         => $bom->id,
            'qty_to_produce' => 10,
            'scheduled_date' => now()->addDays(7)->toDateString(),
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.status', 'draft');

    expect((float) $this->withToken($this->token)->getJson('/api/v1/mfg/orders')->json('data.0.qty_to_produce'))->toBe(10.0);
});

test('can list manufacturing orders', function () {
    $product = makeMfgProduct();

    ManufacturingOrder::create([
        'tenant_id'      => $this->tenant->id,
        'product_id'     => $product->id,
        'qty_to_produce' => 5,
        'qty_produced'   => 0,
        'status'         => 'draft',
        'created_by'     => $this->user->id,
    ]);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/mfg/orders')
        ->assertStatus(200);

    expect(count($response->json('data')))->toBeGreaterThanOrEqual(1);
});

test('can confirm a draft manufacturing order', function () {
    $product = makeMfgProduct();
    $order   = ManufacturingOrder::create([
        'tenant_id'      => $this->tenant->id,
        'product_id'     => $product->id,
        'qty_to_produce' => 5,
        'qty_produced'   => 0,
        'status'         => 'draft',
        'created_by'     => $this->user->id,
    ]);

    $this->withToken($this->token)
        ->postJson("/api/v1/mfg/orders/{$order->id}/confirm")
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'confirmed');
});

test('can start a confirmed manufacturing order', function () {
    $product = makeMfgProduct();
    $order   = ManufacturingOrder::create([
        'tenant_id'      => $this->tenant->id,
        'product_id'     => $product->id,
        'qty_to_produce' => 5,
        'qty_produced'   => 0,
        'status'         => 'confirmed',
        'created_by'     => $this->user->id,
    ]);

    $this->withToken($this->token)
        ->postJson("/api/v1/mfg/orders/{$order->id}/start")
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'in_progress');
});

test('can complete a manufacturing order', function () {
    $product = makeMfgProduct();
    $order   = ManufacturingOrder::create([
        'tenant_id'      => $this->tenant->id,
        'product_id'     => $product->id,
        'qty_to_produce' => 10,
        'qty_produced'   => 0,
        'status'         => 'in_progress',
        'created_by'     => $this->user->id,
    ]);

    $this->withToken($this->token)
        ->postJson("/api/v1/mfg/orders/{$order->id}/complete", ['qty_produced' => 10])
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'done');
});

// ── Work Centers ──────────────────────────────────────────────────────────────

test('can create a work center', function () {
    $this->withToken($this->token)
        ->postJson('/api/v1/mfg/work-centers', [
            'name'     => 'Assembly Line A',
            'code'     => 'ALA',
            'capacity' => 8,
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.name', 'Assembly Line A');
});

test('can list work centers', function () {
    WorkCenter::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Welding Station',
        'is_active' => true,
    ]);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/mfg/work-centers')
        ->assertStatus(200);

    expect(count($response->json('data')))->toBeGreaterThanOrEqual(1);
});

test('requires authentication', function () {
    $this->getJson('/api/v1/mfg/boms')->assertStatus(401);
});
