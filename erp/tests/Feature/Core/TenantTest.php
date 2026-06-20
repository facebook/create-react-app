<?php

use App\Http\Middleware\TenantMiddleware;
use App\Modules\Core\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

test('tenant can be created with required fields', function () {
    $tenant = Tenant::create([
        'name'      => 'Acme Corp',
        'slug'      => 'acme',
        'is_active' => true,
    ]);

    expect($tenant->id)->toBeInt();
    expect($tenant->slug)->toBe('acme');
    expect($tenant->is_active)->toBeTrue();
});

test('tenant settings are cast to array', function () {
    $tenant = Tenant::create([
        'name'     => 'Beta Inc',
        'slug'     => 'beta',
        'settings' => ['currency' => 'USD', 'timezone' => 'UTC'],
    ]);

    $fresh = $tenant->fresh();
    expect($fresh->settings)->toBeArray();
    expect($fresh->settings['currency'])->toBe('USD');
});

test('tenant has many users', function () {
    $tenant = Tenant::create(['name' => 'Gamma Ltd', 'slug' => 'gamma']);
    User::factory()->count(3)->create(['tenant_id' => $tenant->id]);

    expect($tenant->users()->count())->toBe(3);
});

test('inactive tenant is marked correctly', function () {
    $tenant = Tenant::create([
        'name'      => 'Inactive Co',
        'slug'      => 'inactive',
        'is_active' => false,
    ]);

    expect($tenant->is_active)->toBeFalse();
});

test('middleware resolves tenant and binds it into the container', function () {
    $tenant = Tenant::create([
        'name'      => 'Bound Tenant',
        'slug'      => 'bound-co',
        'is_active' => true,
    ]);

    $request = Request::create('/dashboard', 'GET');
    $request->headers->set('X-Tenant', 'bound-co');

    $resolved = null;
    $middleware = new TenantMiddleware();
    $middleware->handle($request, function ($req) use (&$resolved) {
        $resolved = app('tenant');
        return new Response('ok');
    });

    expect($resolved)->not->toBeNull();
    expect($resolved->slug)->toBe('bound-co');
});

test('middleware aborts with 404 for unknown tenant slug', function () {
    $request = Request::create('/dashboard', 'GET');
    $request->headers->set('X-Tenant', 'nonexistent-slug');

    $middleware = new TenantMiddleware();

    expect(fn () => $middleware->handle($request, fn () => new Response('ok')))
        ->toThrow(\Symfony\Component\HttpKernel\Exception\NotFoundHttpException::class);
});

test('middleware aborts with 403 for inactive tenant', function () {
    Tenant::create([
        'name'      => 'Dead Corp',
        'slug'      => 'dead-corp',
        'is_active' => false,
    ]);

    $request = Request::create('/dashboard', 'GET');
    $request->headers->set('X-Tenant', 'dead-corp');

    $middleware = new TenantMiddleware();

    try {
        $middleware->handle($request, fn () => new Response('ok'));
        $this->fail('Expected HttpException was not thrown.');
    } catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) {
        expect($e->getStatusCode())->toBe(403);
    }
});

test('dashboard is accessible without tenant middleware when not applied to route', function () {
    $user = User::factory()->create();

    // Dashboard route does not require tenant middleware — accessible freely
    $response = $this->actingAs($user)->get('/dashboard');
    $response->assertStatus(200);
});
