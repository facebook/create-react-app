<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\KnowledgeBase\Models\KbArticle;
use App\Modules\KnowledgeBase\Models\KbCategory;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'KB Co', 'slug' => 'kb-co']);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

it('returns articles for authenticated user', function () {
    KbArticle::create([
        'tenant_id' => $this->tenant->id,
        'title'     => 'Test Article',
        'slug'      => 'test-article',
        'content'   => 'Article content here',
        'status'    => 'published',
        'author_id' => $this->user->id,
    ]);

    $response = $this->withToken($this->token)->getJson('/api/v1/knowledge-base/articles');

    $response->assertStatus(200)
             ->assertJsonStructure(['success', 'data', 'meta']);
});

it('requires authentication for articles', function () {
    $this->getJson('/api/v1/knowledge-base/articles')->assertStatus(401);
});
