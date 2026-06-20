<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\ProfitCenter;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'ProfitCorp', 'slug' => 'profit-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makePC(array $attrs = []): ProfitCenter
{
    static $seq = 0;
    $seq++;
    return ProfitCenter::create([
        'tenant_id' => test()->tenant->id,
        'code'      => 'PC-' . $seq . '-' . uniqid(),
        'name'      => 'Center ' . $seq,
        'type'      => 'profit',
        ...$attrs,
    ]);
}

it('index requires authentication', function () {
    $this->post('/logout');
    $this->get('/finance/profit-centers')->assertRedirect('/login');
});

it('admin can list profit centers', function () {
    makePC();
    $this->get('/finance/profit-centers')->assertOk();
});

it('store creates a profit center', function () {
    $this->post('/finance/profit-centers', [
        'code' => 'PC-SALES',
        'name' => 'Sales Division',
        'type' => 'profit',
    ])->assertRedirect();

    expect(ProfitCenter::where('code', 'PC-SALES')->exists())->toBeTrue();
});

it('store validates required fields', function () {
    $this->postJson('/finance/profit-centers', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['code', 'name', 'type']);
});

it('store validates type enum', function () {
    $this->postJson('/finance/profit-centers', [
        'code' => 'X1', 'name' => 'X', 'type' => 'invalid',
    ])->assertStatus(422)->assertJsonValidationErrors(['type']);
});

it('store rejects duplicate code', function () {
    makePC(['code' => 'UNIQUE-CODE']);

    $this->postJson('/finance/profit-centers', [
        'code' => 'UNIQUE-CODE', 'name' => 'Another', 'type' => 'cost',
    ])->assertStatus(422)->assertJsonValidationErrors(['code']);
});

it('show displays a profit center', function () {
    $pc = makePC();
    $this->get("/finance/profit-centers/{$pc->id}")->assertOk();
});

it('defaults to active status', function () {
    $pc = makePC();
    expect($pc->status)->toBe('active');
    expect($pc->is_active)->toBeTrue();
});

it('activate and deactivate transitions work', function () {
    $pc = makePC(['status' => 'inactive']);
    expect($pc->status)->toBe('inactive');

    $this->post("/finance/profit-centers/{$pc->id}/activate")->assertRedirect();
    expect($pc->fresh()->status)->toBe('active');

    $this->post("/finance/profit-centers/{$pc->id}/deactivate")->assertRedirect();
    expect($pc->fresh()->status)->toBe('inactive');
});

it('type accessors work', function () {
    $pc = makePC(['type' => 'cost']);
    expect($pc->is_cost_center)->toBeTrue();
    expect($pc->is_profit_center)->toBeFalse();

    $p2 = makePC(['type' => 'profit']);
    expect($p2->is_profit_center)->toBeTrue();
    expect($p2->is_cost_center)->toBeFalse();
});

it('parent-child relationship works', function () {
    $parent = makePC();
    $child  = makePC(['parent_id' => $parent->id]);

    expect($child->parent->id)->toBe($parent->id);
    expect($parent->children->first()->id)->toBe($child->id);
});

it('update modifies name and budget', function () {
    $pc = makePC();
    $this->put("/finance/profit-centers/{$pc->id}", [
        'code'   => $pc->code,
        'name'   => 'Updated Name',
        'type'   => 'cost',
        'budget' => 50000,
    ])->assertRedirect();

    $pc->refresh();
    expect($pc->name)->toBe('Updated Name');
    expect($pc->type)->toBe('cost');
    expect($pc->budget)->toBe(50000.0);
});

it('destroy soft-deletes a profit center', function () {
    $pc = makePC();
    $this->delete("/finance/profit-centers/{$pc->id}")->assertRedirect();
    expect(ProfitCenter::find($pc->id))->toBeNull();
    expect(ProfitCenter::withTrashed()->find($pc->id))->not->toBeNull();
});
