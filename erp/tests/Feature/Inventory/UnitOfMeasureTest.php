<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\UnitOfMeasure;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'UoMCorp', 'slug' => 'uom-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeUom(array $attrs = []): UnitOfMeasure
{
    return UnitOfMeasure::create([
        'tenant_id'         => test()->tenant->id,
        'name'              => 'Kilogram-' . uniqid(),
        'abbreviation'      => 'kg',
        'type'              => 'weight',
        'is_base'           => true,
        'conversion_factor' => 1.0,
        'is_active'         => true,
        ...$attrs,
    ]);
}

it('index requires auth', function () {
    $this->post('/logout');
    $this->get('/inventory/units-of-measure')->assertRedirect('/login');
});

it('admin can list units of measure', function () {
    makeUom();
    $this->get('/inventory/units-of-measure')->assertStatus(200);
});

it('staff with inventory.view can list UoMs', function () {
    $this->actingAs($this->staff);
    $this->get('/inventory/units-of-measure')->assertStatus(200);
});

it('store creates a unit of measure', function () {
    $this->post('/inventory/units-of-measure', [
        'name'              => 'Gram',
        'abbreviation'      => 'g',
        'type'              => 'weight',
        'is_base'           => false,
        'conversion_factor' => 0.001,
        'is_active'         => true,
    ])->assertRedirect();

    expect(UnitOfMeasure::where('abbreviation', 'g')->exists())->toBeTrue();
});

it('store validates required fields', function () {
    $this->postJson('/inventory/units-of-measure', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'abbreviation']);
});

it('show displays a unit of measure', function () {
    $uom = makeUom();
    $this->get("/inventory/units-of-measure/{$uom->id}")->assertStatus(200);
});

it('update modifies a unit of measure', function () {
    $uom = makeUom();
    $this->put("/inventory/units-of-measure/{$uom->id}", [
        'name'              => 'Kilogram Updated',
        'abbreviation'      => 'kg',
        'type'              => 'weight',
        'is_base'           => true,
        'conversion_factor' => 1.0,
        'is_active'         => true,
    ])->assertRedirect();

    expect($uom->fresh()->name)->toBe('Kilogram Updated');
});

it('destroy deletes the unit', function () {
    $uom = makeUom();
    $this->delete("/inventory/units-of-measure/{$uom->id}")->assertRedirect();
    expect(UnitOfMeasure::find($uom->id))->toBeNull();
});

it('convertTo correctly converts between units', function () {
    $kg = makeUom([
        'name'              => 'Kilogram-conv-' . uniqid(),
        'abbreviation'      => 'kg',
        'conversion_factor' => 1000.0,
        'is_base'           => false,
    ]);

    $g = makeUom([
        'name'              => 'Gram-conv-' . uniqid(),
        'abbreviation'      => 'g',
        'conversion_factor' => 1.0,
        'is_base'           => true,
    ]);

    // 1 kg = 1000 g when kg has conversion_factor=1000 and g has conversion_factor=1
    $result = $kg->convertTo(1.0, $g);
    expect($result)->toBe(1000.0);
});

it('display_name accessor returns name (abbreviation)', function () {
    $uom = makeUom([
        'name'         => 'Metre',
        'abbreviation' => 'm',
    ]);

    expect($uom->display_name)->toBe('Metre (m)');
});
