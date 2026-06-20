<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\GoodsReceipt;
use App\Modules\Inventory\Models\GoodsReceiptItem;
use App\Modules\Inventory\Models\Product;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'ReceiptCorp', 'slug' => 'receipt-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeGRProduct(array $attrs = []): Product
{
    return Product::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Product ' . uniqid(),
        'sku'       => 'SKU-GR-' . uniqid(),
        ...$attrs,
    ]);
}

function makeGoodsReceipt(array $attrs = []): GoodsReceipt
{
    return GoodsReceipt::create([
        'tenant_id'     => test()->tenant->id,
        'supplier_name' => 'Supplier ' . uniqid(),
        'receipt_date'  => now()->toDateString(),
        'created_by'    => test()->admin->id,
        ...$attrs,
    ]);
}

it('index requires authentication', function () {
    $this->post('/logout');
    $this->get('/inventory/goods-receipts')->assertRedirect('/login');
});

it('admin can list goods receipts', function () {
    makeGoodsReceipt();
    $this->get('/inventory/goods-receipts')->assertOk();
});

it('store creates a goods receipt', function () {
    $this->post('/inventory/goods-receipts', [
        'supplier_name' => 'Global Supplies Ltd',
        'receipt_date'  => now()->toDateString(),
    ])->assertRedirect();

    expect(GoodsReceipt::where('supplier_name', 'Global Supplies Ltd')->exists())->toBeTrue();
});

it('store validates required fields', function () {
    $this->postJson('/inventory/goods-receipts', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['supplier_name', 'receipt_date']);
});

it('show displays a goods receipt', function () {
    $receipt = makeGoodsReceipt();
    $this->get("/inventory/goods-receipts/{$receipt->id}")->assertOk();
});

it('confirm transitions status to confirmed', function () {
    $receipt = makeGoodsReceipt();
    expect($receipt->status)->toBe('draft');
    expect($receipt->is_draft)->toBeTrue();

    $this->post("/inventory/goods-receipts/{$receipt->id}/confirm")->assertRedirect();

    $receipt->refresh();
    expect($receipt->status)->toBe('confirmed');
    expect($receipt->is_confirmed)->toBeTrue();
    expect($receipt->receipt_number)->not->toBeNull();
    expect($receipt->confirmed_at)->not->toBeNull();
});

it('post transitions status to posted', function () {
    $receipt = makeGoodsReceipt(['status' => 'confirmed']);
    $this->post("/inventory/goods-receipts/{$receipt->id}/post")->assertRedirect();
    $receipt->refresh();
    expect($receipt->status)->toBe('posted');
});

it('reject transitions status to rejected', function () {
    $receipt = makeGoodsReceipt(['status' => 'confirmed']);
    $this->post("/inventory/goods-receipts/{$receipt->id}/reject")->assertRedirect();
    $receipt->refresh();
    expect($receipt->status)->toBe('rejected');
});

it('line_total accessor works on receipt item', function () {
    $receipt = makeGoodsReceipt();
    $product = makeGRProduct();
    $item = GoodsReceiptItem::create([
        'goods_receipt_id'  => $receipt->id,
        'product_id'        => $product->id,
        'quantity_received' => 10,
        'unit_cost'         => 25,
    ]);
    expect((float)$item->line_total)->toBe(250.0);
});

it('destroy soft-deletes the receipt', function () {
    $receipt = makeGoodsReceipt();
    $this->delete("/inventory/goods-receipts/{$receipt->id}")->assertRedirect();
    expect(GoodsReceipt::find($receipt->id))->toBeNull();
    expect(GoodsReceipt::withTrashed()->find($receipt->id))->not->toBeNull();
});
