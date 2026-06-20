<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Test Co', 'slug' => 'test-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
});

test('contacts index is accessible', function () {
    $this->actingAs($this->admin)
        ->get('/finance/contacts')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Finance/Contacts/Index'));
});

test('contact can be created', function () {
    $this->actingAs($this->admin)
        ->post('/finance/contacts', [
            'name'  => 'Acme Corp',
            'type'  => 'customer',
            'email' => 'billing@acme.com',
        ])
        ->assertRedirect('/finance/contacts');

    expect(Contact::where('name', 'Acme Corp')->exists())->toBeTrue();
});

test('contact requires a name', function () {
    $this->actingAs($this->admin)
        ->post('/finance/contacts', ['type' => 'customer'])
        ->assertSessionHasErrors('name');
});

test('contact can be updated', function () {
    $contact = Contact::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Old Name',
        'type'      => 'customer',
    ]);

    $this->actingAs($this->admin)
        ->put("/finance/contacts/{$contact->id}", [
            'name' => 'New Name', 'type' => 'vendor', 'is_active' => true,
        ])
        ->assertRedirect('/finance/contacts');

    expect($contact->fresh()->name)->toBe('New Name');
    expect($contact->fresh()->type)->toBe('vendor');
});

test('contact can be deleted', function () {
    $contact = Contact::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'To Delete',
        'type'      => 'customer',
    ]);

    $this->actingAs($this->admin)
        ->delete("/finance/contacts/{$contact->id}")
        ->assertRedirect('/finance/contacts');

    expect(Contact::withTrashed()->find($contact->id)->deleted_at)->not->toBeNull();
});

test('contact customer scope works', function () {
    Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'Cust A', 'type' => 'customer']);
    Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'Vendor A', 'type' => 'vendor']);
    Contact::create(['tenant_id' => $this->tenant->id, 'name' => 'Both A', 'type' => 'both']);

    expect(Contact::customers()->count())->toBe(2);
    expect(Contact::vendors()->count())->toBe(2);
});
