<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Website\Models\BlogPost;
use App\Modules\Website\Models\WebMenu;
use App\Modules\Website\Models\WebPage;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Website Corp', 'slug' => 'website-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeWebPage(array $attrs = []): WebPage
{
    return WebPage::create(array_merge([
        'tenant_id' => test()->tenant->id,
        'title'     => 'Test Page ' . uniqid(),
        'slug'      => 'test-page-' . uniqid(),
        'status'    => 'draft',
    ], $attrs));
}

function makeBlogPost(array $attrs = []): BlogPost
{
    return BlogPost::create(array_merge([
        'tenant_id' => test()->tenant->id,
        'title'     => 'Test Post ' . uniqid(),
        'slug'      => 'test-post-' . uniqid(),
        'status'    => 'draft',
    ], $attrs));
}

function makeWebMenu(array $attrs = []): WebMenu
{
    return WebMenu::create(array_merge([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Test Menu ' . uniqid(),
        'location'  => 'header',
        'items'     => [],
    ], $attrs));
}

// 1. Dashboard renders
it('renders website dashboard', function () {
    $this->get('/website/dashboard')->assertOk();
});

// 2. Pages index renders
it('renders pages index', function () {
    makeWebPage();
    $this->get('/website/pages')->assertOk();
});

// 3. Can create a web page
it('can create a web page', function () {
    $this->post('/website/pages', [
        'title'  => 'About Us',
        'slug'   => 'about-us',
        'status' => 'draft',
    ])->assertRedirect();

    $page = WebPage::where('slug', 'about-us')->first();
    expect($page)->not->toBeNull();
    expect($page->title)->toBe('About Us');
    expect($page->status)->toBe('draft');
});

// 4. Can publish a page (status becomes published)
it('can publish a page', function () {
    $page = makeWebPage(['status' => 'draft']);

    $this->post("/website/pages/{$page->id}/publish")->assertOk();

    expect($page->fresh()->status)->toBe('published');
    expect($page->fresh()->published_at)->not->toBeNull();
});

// 5. Blog index renders
it('renders blog index', function () {
    makeBlogPost();
    $this->get('/website/blog')->assertOk();
});

// 6. Can create a blog post
it('can create a blog post', function () {
    $this->post('/website/blog', [
        'title'   => 'Hello World',
        'slug'    => 'hello-world',
        'content' => 'This is the first blog post.',
    ])->assertRedirect();

    $post = BlogPost::where('slug', 'hello-world')->first();
    expect($post)->not->toBeNull();
    expect($post->title)->toBe('Hello World');
    expect($post->author_id)->toBe($this->admin->id);
});

// 7. Can publish a blog post
it('can publish a blog post', function () {
    $post = makeBlogPost(['status' => 'draft']);

    $this->post("/website/blog/{$post->id}/publish")->assertOk();

    expect($post->fresh()->status)->toBe('published');
    expect($post->fresh()->published_at)->not->toBeNull();
});

// 8. Menus index renders
it('renders menus index', function () {
    makeWebMenu();
    $this->get('/website/menus')->assertOk();
});

// 9. Can create a menu
it('can create a menu', function () {
    $this->post('/website/menus', [
        'name'     => 'Main Navigation',
        'location' => 'header',
    ])->assertRedirect();

    $menu = WebMenu::where('name', 'Main Navigation')->first();
    expect($menu)->not->toBeNull();
    expect($menu->location)->toBe('header');
});

// 10. Can update a menu's items
it('can update a menu items', function () {
    $menu = makeWebMenu();

    $items = [
        ['label' => 'Home', 'url' => '/'],
        ['label' => 'About', 'url' => '/about'],
    ];

    $this->put("/website/menus/{$menu->id}", [
        'items' => $items,
    ])->assertOk()->assertJson(['success' => true]);

    expect($menu->fresh()->items)->toHaveCount(2);
});
