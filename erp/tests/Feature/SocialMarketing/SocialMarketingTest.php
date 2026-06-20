<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\SocialMarketing\Models\SocialAccount;
use App\Modules\SocialMarketing\Models\SocialPost;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Social Corp', 'slug' => 'social-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeSocialAccount(array $overrides = []): SocialAccount
{
    return SocialAccount::create(array_merge([
        'tenant_id'    => test()->tenant->id,
        'platform'     => 'facebook',
        'account_name' => 'Test Page ' . uniqid(),
        'is_connected' => true,
        'is_active'    => true,
    ], $overrides));
}

function makeSocialPost(array $overrides = []): SocialPost
{
    return SocialPost::create(array_merge([
        'tenant_id'          => test()->tenant->id,
        'content'            => 'Test post content ' . uniqid(),
        'platforms'          => ['facebook'],
        'social_account_ids' => [],
        'status'             => 'draft',
        'created_by'         => test()->admin->id,
    ], $overrides));
}

// 1. Dashboard renders
it('renders social marketing dashboard', function () {
    $this->get('/social-marketing/dashboard')->assertOk();
});

// 2. Accounts index renders
it('renders social accounts index', function () {
    $this->get('/social-marketing/accounts')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('SocialMarketing/Accounts/Index'));
});

// 3. Can create a social account
it('can create a social account', function () {
    $this->post('/social-marketing/accounts', [
        'platform'     => 'twitter',
        'account_name' => 'My Twitter Page',
    ])->assertRedirect();

    expect(SocialAccount::where('tenant_id', $this->tenant->id)
        ->where('platform', 'twitter')
        ->exists()
    )->toBeTrue();
});

// 4. Can toggle account connection
it('can toggle account connection', function () {
    $account = makeSocialAccount(['is_connected' => true]);

    $this->post("/social-marketing/accounts/{$account->id}/toggle")
        ->assertRedirect();

    expect($account->fresh()->is_connected)->toBeFalse();
});

// 5. Posts index renders
it('renders social posts index', function () {
    $this->get('/social-marketing/posts')->assertOk();
});

// 6. Posts create page renders
it('renders social posts create page', function () {
    $this->get('/social-marketing/posts/create')->assertOk();
});

// 7. Can create a draft post
it('can create a draft post', function () {
    $this->post('/social-marketing/posts', [
        'content'   => 'Hello World post content',
        'platforms' => ['facebook', 'twitter'],
    ])->assertRedirect();

    expect(SocialPost::where('tenant_id', $this->tenant->id)
        ->where('status', 'draft')
        ->exists()
    )->toBeTrue();
});

// 8. Can publish a post
it('can publish a post', function () {
    $post = makeSocialPost(['status' => 'draft']);

    $this->post("/social-marketing/posts/{$post->id}/publish")
        ->assertRedirect();

    expect($post->fresh()->status)->toBe('published');
});

// 9. Can schedule a post
it('can schedule a post', function () {
    $post = makeSocialPost(['status' => 'draft']);
    $scheduledAt = now()->addDay()->format('Y-m-d H:i:s');

    $this->post("/social-marketing/posts/{$post->id}/schedule", [
        'scheduled_at' => $scheduledAt,
    ])->assertRedirect();

    expect($post->fresh()->status)->toBe('scheduled');
});

// 10. Can delete a post
it('can delete a post', function () {
    $post = makeSocialPost();

    $this->delete("/social-marketing/posts/{$post->id}")
        ->assertRedirect();

    expect(SocialPost::find($post->id))->toBeNull();
});
