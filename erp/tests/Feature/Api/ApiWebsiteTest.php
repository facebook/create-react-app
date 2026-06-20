<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Website\Models\WebPage;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Web Co', 'slug' => 'web-co']);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

it('returns pages for authenticated user', function () {
    WebPage::create([
        'tenant_id' => $this->tenant->id,
        'title'     => 'Home Page',
        'slug'      => 'home',
        'status'    => 'published',
    ]);

    $response = $this->withToken($this->token)->getJson('/api/v1/website/pages');

    $response->assertStatus(200)
             ->assertJsonStructure(['success', 'data', 'meta']);
});

it('requires authentication for pages', function () {
    $this->getJson('/api/v1/website/pages')->assertStatus(401);
});
