<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\ReorderRule;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'ReorderCorp', 'slug' => 'reorder-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeRRProduct(array $attrs = []): Product
{
    return Product::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Product ' . uniqid(),
        'sku'       => 'SKU-' . uniqid(),
        ...$attrs,
    ]);
}

function makeReorderRule(array $attrs = []): ReorderRule
{
    $product = makeRRProduct();
    return ReorderRule::create([
        'tenant_id'        => test()->tenant->id,
        'product_id'       => $product->id,
        'reorder_point'    => 10,
        'reorder_quantity' => 50,
        'created_by'       => test()->admin->id,
        ...$attrs,
    ]);
}

it('index requires authentication', function () {
    $this->post('/logout');
    $this->get('/inventory/reorder-rules')->assertRedirect('/login');
});

it('admin can list reorder rules', function () {
    makeReorderRule();
    $this->get('/inventory/reorder-rules')->assertOk();
});

it('store creates a reorder rule', function () {
    $product = makeRRProduct();
    $this->post('/inventory/reorder-rules', [
        'product_id'       => $product->id,
        'reorder_point'    => 5,
        'reorder_quantity' => 100,
    ])->assertRedirect();

    expect(ReorderRule::where('product_id', $product->id)->exists())->toBeTrue();
});

it('store validates required fields', function () {
    $this->postJson('/inventory/reorder-rules', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['product_id', 'reorder_point', 'reorder_quantity']);
});

it('show displays a reorder rule', function () {
    $rule = makeReorderRule();
    $this->get("/inventory/reorder-rules/{$rule->id}")->assertOk();
});

it('trigger transitions status to triggered', function () {
    $rule = makeReorderRule();
    expect($rule->status)->toBe('active');
    expect($rule->needs_reorder)->toBeTrue();

    $this->post("/inventory/reorder-rules/{$rule->id}/trigger")->assertRedirect();

    $rule->refresh();
    expect($rule->status)->toBe('triggered');
    expect($rule->last_triggered_at)->not->toBeNull();
    expect($rule->is_triggered)->toBeTrue();
});

it('pause transitions status to paused', function () {
    $rule = makeReorderRule();
    $this->post("/inventory/reorder-rules/{$rule->id}/pause")->assertRedirect();
    $rule->refresh();
    expect($rule->status)->toBe('paused');
    expect($rule->is_paused)->toBeTrue();
});

it('resume transitions status to active', function () {
    $rule = makeReorderRule(['status' => 'paused']);
    $this->post("/inventory/reorder-rules/{$rule->id}/resume")->assertRedirect();
    $rule->refresh();
    expect($rule->status)->toBe('active');
});

it('destroy soft-deletes the rule', function () {
    $rule = makeReorderRule();
    $this->delete("/inventory/reorder-rules/{$rule->id}")->assertRedirect();
    expect(ReorderRule::find($rule->id))->toBeNull();
    expect(ReorderRule::withTrashed()->find($rule->id))->not->toBeNull();
});
