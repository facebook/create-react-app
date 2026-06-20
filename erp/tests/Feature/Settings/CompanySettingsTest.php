<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant  = Tenant::create(['name' => 'Settings Co', 'slug' => 'settings-co']);
    $this->admin   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('admin');
    $this->manager = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->manager->assignRole('manager');
    $this->staff   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
});

test('admin can view company settings', function () {
    $this->actingAs($this->admin)
        ->get('/settings/company')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->component('Settings/Company')
            ->has('tenant')
            ->has('currencies')
            ->has('timezones')
            ->has('dateFormats')
        );
});

test('manager cannot access company settings', function () {
    $this->actingAs($this->manager)
        ->get('/settings/company')
        ->assertStatus(403);
});

test('staff cannot access company settings', function () {
    $this->actingAs($this->staff)
        ->get('/settings/company')
        ->assertStatus(403);
});

test('guest is redirected', function () {
    $this->get('/settings/company')->assertRedirect();
});

test('admin can update company settings', function () {
    $this->actingAs($this->admin)
        ->patch('/settings/company', [
            'name'          => 'Updated Co',
            'email'         => 'info@updated.com',
            'phone'         => '+1-555-0100',
            'address'       => '123 Main St',
            'city'          => 'New York',
            'country'       => 'USA',
            'currency_code' => 'EUR',
            'timezone'      => 'Europe/London',
            'date_format'   => 'd/m/Y',
        ])
        ->assertSessionHasNoErrors();

    $tenant = $this->tenant->fresh();
    expect($tenant->name)->toBe('Updated Co');
    expect($tenant->currency_code)->toBe('EUR');
    expect($tenant->timezone)->toBe('Europe/London');
});

test('name is required', function () {
    $this->actingAs($this->admin)
        ->patch('/settings/company', [
            'name'          => '',
            'currency_code' => 'USD',
            'timezone'      => 'UTC',
            'date_format'   => 'Y-m-d',
        ])
        ->assertSessionHasErrors('name');
});

test('invalid timezone is rejected', function () {
    $this->actingAs($this->admin)
        ->patch('/settings/company', [
            'name'          => 'Co',
            'currency_code' => 'USD',
            'timezone'      => 'Not/A/Timezone',
            'date_format'   => 'Y-m-d',
        ])
        ->assertSessionHasErrors('timezone');
});
