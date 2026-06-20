<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\SocialMarketing\Models\SocialAccount;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Social Co', 'slug' => 'social-co']);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

it('returns accounts for authenticated user', function () {
    SocialAccount::create([
        'tenant_id'      => $this->tenant->id,
        'platform'       => 'twitter',
        'account_name'   => 'My Twitter',
        'account_handle' => '@myhandle',
        'is_connected'   => true,
        'is_active'      => true,
    ]);

    $response = $this->withToken($this->token)->getJson('/api/v1/social-marketing/accounts');

    $response->assertStatus(200)
             ->assertJsonStructure(['success', 'data', 'meta']);
});

it('requires authentication for accounts', function () {
    $this->getJson('/api/v1/social-marketing/accounts')->assertStatus(401);
});
