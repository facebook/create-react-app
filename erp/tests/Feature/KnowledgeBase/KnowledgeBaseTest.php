<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\KnowledgeBase\Models\KbArticle;
use App\Modules\KnowledgeBase\Models\KbCategory;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'KB Corp', 'slug' => 'kb-corp-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->actingAs($this->user);
    app()->instance('tenant', $this->tenant);
});

// Helper to create an article
function makeArticle(array $attrs = []): KbArticle
{
    return KbArticle::create(array_merge([
        'tenant_id' => test()->tenant->id,
        'title'     => 'Test Article ' . uniqid(),
        'slug'      => 'test-article-' . uniqid(),
        'content'   => 'Some content here.',
        'status'    => 'draft',
        'author_id' => test()->user->id,
    ], $attrs));
}

// Helper to create a category
function makeKbCategory(array $attrs = []): KbCategory
{
    return KbCategory::create(array_merge([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Test Category ' . uniqid(),
        'slug'      => 'test-category-' . uniqid(),
    ], $attrs));
}

// 1. Lists articles
it('lists articles', function () {
    makeArticle();
    $this->get('/kb')->assertOk();
});

// 2. Lists categories
it('lists categories', function () {
    makeKbCategory();
    $this->get('/kb/categories')->assertOk();
});

// 3. Creates a category
it('creates a category', function () {
    $this->post('/kb/categories', [
        'name' => 'Getting Started',
    ])->assertRedirect();

    $category = KbCategory::where('name', 'Getting Started')->first();
    expect($category)->not->toBeNull();
    expect($category->slug)->toBe('getting-started');
});

// 4. Creates an article
it('creates an article', function () {
    $this->post('/kb', [
        'title'   => 'How to Install',
        'content' => 'Follow these steps to install the software.',
    ])->assertRedirect();

    $article = KbArticle::where('title', 'How to Install')->first();
    expect($article)->not->toBeNull();
    expect($article->status)->toBe('draft');
    expect($article->slug)->toBe('how-to-install');
});

// 5. Shows an article and increments views
it('shows an article and increments views', function () {
    $article = makeArticle(['views' => 0]);
    $this->get("/kb/{$article->id}")->assertOk();

    expect($article->fresh()->views)->toBe(1);
});

// 6. Publishes an article
it('publishes an article', function () {
    $article = makeArticle(['status' => 'draft']);
    $this->post("/kb/{$article->id}/publish")->assertRedirect();

    expect($article->fresh()->status)->toBe('published');
    expect($article->fresh()->published_at)->not->toBeNull();
});

// 7. Archives an article
it('archives an article', function () {
    $article = makeArticle(['status' => 'published']);
    $this->post("/kb/{$article->id}/archive")->assertRedirect();

    expect($article->fresh()->status)->toBe('archived');
});

// 8. Searches articles
it('searches articles', function () {
    makeArticle([
        'title'   => 'Unique Search Term XYZ',
        'content' => 'Content about searching.',
        'status'  => 'published',
        'slug'    => 'unique-search-term-xyz',
    ]);

    $response = $this->get('/kb/search?q=Unique+Search+Term+XYZ')->assertOk();
    $response->assertInertia(fn ($page) => $page->has('articles'));
});

// 9. Updates an article
it('updates an article', function () {
    $article = makeArticle(['status' => 'draft']);
    $this->patch("/kb/{$article->id}", [
        'title'   => 'Updated Title',
        'content' => 'Updated content.',
    ])->assertRedirect();

    expect($article->fresh()->title)->toBe('Updated Title');
});

// 10. Deletes an article (soft delete)
it('deletes an article', function () {
    $article = makeArticle();
    $this->delete("/kb/{$article->id}")->assertRedirect();

    expect(KbArticle::find($article->id))->toBeNull();
    expect(KbArticle::withTrashed()->find($article->id))->not->toBeNull();
});
