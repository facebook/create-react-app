<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Core\Models\TenantSetting;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Test Co', 'slug' => 'test-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
});

test('settings page is accessible to admin', function () {
    $this->actingAs($this->admin)
        ->get('/settings')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Settings/Index'));
});

test('settings can be saved', function () {
    $this->actingAs($this->admin)
        ->put('/settings', [
            'company_name'      => 'My Company',
            'currency'          => 'EUR',
            'timezone'          => 'Europe/London',
            'fiscal_year_start' => '04-01',
        ])
        ->assertRedirect();

    expect(TenantSetting::getValue($this->tenant->id, 'company_name'))->toBe('My Company');
    expect(TenantSetting::getValue($this->tenant->id, 'currency'))->toBe('EUR');
});

test('settings getValue returns default when key missing', function () {
    $result = TenantSetting::getValue($this->tenant->id, 'nonexistent_key', 'fallback');
    expect($result)->toBe('fallback');
});

test('settings setValue updates existing value', function () {
    TenantSetting::setValue($this->tenant->id, 'company_name', 'First Name');
    TenantSetting::setValue($this->tenant->id, 'company_name', 'Updated Name');

    expect(TenantSetting::where('tenant_id', $this->tenant->id)->where('key', 'company_name')->count())->toBe(1);
    expect(TenantSetting::getValue($this->tenant->id, 'company_name'))->toBe('Updated Name');
});

test('staff cannot access settings', function () {
    $staff = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $staff->assignRole('staff');

    $this->actingAs($staff)->get('/settings')->assertStatus(403);
});

test('fiscal_year_start must match MM-DD format', function () {
    $this->actingAs($this->admin)
        ->put('/settings', [
            'company_name'      => 'Test',
            'currency'          => 'USD',
            'timezone'          => 'UTC',
            'fiscal_year_start' => 'invalid',
        ])
        ->assertSessionHasErrors(['fiscal_year_start']);
});
