<?php

use App\Models\User;
use App\Modules\Core\Models\SsoProvider;
use App\Modules\Core\Models\Tenant;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'SSO Corp', 'slug' => 'sso-corp']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeSsoProvider(array $attrs = []): SsoProvider
{
    return SsoProvider::create(array_merge([
        'tenant_id'    => test()->tenant->id,
        'name'         => 'Corporate IdP',
        'provider_type' => 'saml',
        'is_active'    => true,
        'entity_id'    => 'https://idp.example.com/saml',
        'sso_url'      => 'https://idp.example.com/sso',
        'email_attribute' => 'email',
        'name_attribute'  => 'displayName',
    ], $attrs));
}

// Test 1: SSO settings page renders
test('sso settings page renders with providers', function () {
    makeSsoProvider();

    $this->get('/settings/sso')
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('Settings/Sso')
            ->has('providers', 1)
        );
});

// Test 2: Store creates an SSO provider
test('store creates sso provider', function () {
    $this->post('/settings/sso', [
        'name'          => 'Okta SAML',
        'provider_type' => 'saml',
        'sso_url'       => 'https://okta.example.com/sso',
        'email_attribute' => 'email',
    ])->assertRedirect('/settings/sso');

    expect(SsoProvider::where('tenant_id', $this->tenant->id)->where('name', 'Okta SAML')->exists())->toBeTrue();
});

// Test 3: Store validates required fields
test('store validates required fields', function () {
    $this->postJson('/settings/sso', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'provider_type']);
});

// Test 4: Provider type must be valid
test('store rejects invalid provider type', function () {
    $this->postJson('/settings/sso', [
        'name'          => 'Test',
        'provider_type' => 'ldap',
    ])->assertStatus(422)
      ->assertJsonValidationErrors(['provider_type']);
});

// Test 5: Update modifies an existing provider
test('update modifies sso provider', function () {
    $provider = makeSsoProvider();

    $this->patch("/settings/sso/{$provider->id}", [
        'name'          => 'Updated IdP',
        'provider_type' => 'saml',
        'email_attribute' => 'mail',
    ])->assertRedirect('/settings/sso');

    expect($provider->fresh()->name)->toBe('Updated IdP');
});

// Test 6: Destroy deletes a provider
test('destroy deletes sso provider', function () {
    $provider = makeSsoProvider();

    $this->delete("/settings/sso/{$provider->id}")
        ->assertRedirect('/settings/sso');

    expect(SsoProvider::find($provider->id))->toBeNull();
});

// Test 7: SP metadata endpoint returns XML for SAML providers
test('sp metadata endpoint returns xml', function () {
    $provider = makeSsoProvider();

    $this->get("/sso/saml/{$provider->id}/metadata")
        ->assertStatus(200)
        ->assertHeader('Content-Type', 'application/xml');
});

// Test 8: Metadata XML contains SP entity ID
test('metadata xml contains sp entity id', function () {
    $provider = makeSsoProvider();

    $response = $this->get("/sso/saml/{$provider->id}/metadata");
    $response->assertStatus(200);
    expect($response->getContent())->toContain('EntityDescriptor');
    expect($response->getContent())->toContain('AssertionConsumerService');
});

// Test 9: buildAuthnRequest generates valid XML
test('build authn request generates xml', function () {
    $provider = makeSsoProvider();
    $xml      = $provider->buildAuthnRequest();

    expect($xml)->toContain('AuthnRequest');
    expect($xml)->toContain('samlp:AuthnRequest');
    expect($xml)->toContain($provider->getAcsUrl());
});

// Test 10: SsoProvider getSpEntityId and getAcsUrl return expected URLs
test('sso provider generates correct sp urls', function () {
    $provider = makeSsoProvider();

    expect($provider->getSpEntityId())->toContain("/sso/saml/{$provider->id}/metadata");
    expect($provider->getAcsUrl())->toContain("/sso/saml/{$provider->id}/acs");
});
