<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\CustomerPortalToken;
use App\Modules\Finance\Models\Invoice;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Portal Co', 'slug' => 'portal-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makePortalContact(): Contact
{
    return Contact::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Portal Customer',
        'type'      => 'customer',
    ]);
}

it('admin can generate portal token', function () {
    $contact = makePortalContact();
    $this->post("/finance/contacts/{$contact->id}/portal-token", [
        'email'       => 'customer@example.com',
        'expires_days' => 30,
    ])->assertRedirect();
    expect(CustomerPortalToken::where('contact_id', $contact->id)->exists())->toBeTrue();
});

it('generated token is 64 chars', function () {
    $contact = makePortalContact();
    $this->post("/finance/contacts/{$contact->id}/portal-token", [
        'email' => 'customer@example.com',
    ]);
    $token = CustomerPortalToken::where('contact_id', $contact->id)->first();
    expect(strlen($token->token))->toBe(64);
});

it('portal token expires_at is set', function () {
    $contact = makePortalContact();
    $this->post("/finance/contacts/{$contact->id}/portal-token", [
        'email'        => 'customer@example.com',
        'expires_days' => 7,
    ]);
    $token = CustomerPortalToken::where('contact_id', $contact->id)->first();
    expect($token->expires_at)->not->toBeNull();
    expect($token->expires_at->isFuture())->toBeTrue();
});

it('portal show page is accessible with valid token', function () {
    $contact = makePortalContact();
    $token = CustomerPortalToken::generate(
        test()->tenant->id,
        $contact->id,
        'customer@example.com',
        30
    );
    // Portal is public — log out first
    auth()->logout();
    $this->get("/portal/{$token->token}")->assertStatus(200);
});

it('expired token returns 403', function () {
    $contact = makePortalContact();
    $token = CustomerPortalToken::create([
        'tenant_id'  => test()->tenant->id,
        'contact_id' => $contact->id,
        'token'      => str_repeat('a', 64),
        'email'      => 'customer@example.com',
        'expires_at' => now()->subDay(),
    ]);
    auth()->logout();
    $this->get("/portal/{$token->token}")->assertStatus(403);
});

it('is_expired returns true for past expiry', function () {
    $contact = makePortalContact();
    $token = CustomerPortalToken::create([
        'tenant_id'  => test()->tenant->id,
        'contact_id' => $contact->id,
        'token'      => str_repeat('b', 64),
        'email'      => 'customer@example.com',
        'expires_at' => now()->subHour(),
    ]);
    expect($token->is_expired)->toBeTrue();
});

it('is_expired returns false when no expiry', function () {
    $contact = makePortalContact();
    $token = CustomerPortalToken::create([
        'tenant_id'  => test()->tenant->id,
        'contact_id' => $contact->id,
        'token'      => str_repeat('c', 64),
        'email'      => 'customer@example.com',
        'expires_at' => null,
    ]);
    expect($token->is_expired)->toBeFalse();
});

it('last_accessed_at is updated on portal visit', function () {
    $contact = makePortalContact();
    $token = CustomerPortalToken::generate(test()->tenant->id, $contact->id, 'c@example.com', 30);
    auth()->logout();
    $this->get("/portal/{$token->token}");
    expect($token->fresh()->last_accessed_at)->not->toBeNull();
});

it('invalid token returns 404', function () {
    auth()->logout();
    $this->get('/portal/' . str_repeat('z', 64))->assertStatus(404);
});

it('generate token requires email', function () {
    $this->actingAs(test()->admin);
    $contact = makePortalContact();
    $this->postJson("/finance/contacts/{$contact->id}/portal-token", [])
        ->assertStatus(422);
});
