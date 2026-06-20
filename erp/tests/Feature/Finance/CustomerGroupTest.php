<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\CustomerGroup;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'GrpCorp', 'slug' => 'grp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('manager');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeCustomerGroup(array $attrs = []): CustomerGroup
{
    return CustomerGroup::create([
        'tenant_id'        => test()->tenant->id,
        'name'             => 'Group-' . uniqid(),
        'discount_percent' => 10.0,
        'credit_limit'     => 5000.00,
        'currency'         => 'USD',
        'is_active'        => true,
        ...$attrs,
    ]);
}

function makeGroupContact(): Contact
{
    return Contact::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Contact-' . uniqid(),
        'email'     => 'contact-' . uniqid() . '@example.com',
        'type'      => 'customer',
        'is_active' => true,
    ]);
}

it('index requires auth', function () {
    $this->post('/logout');
    $this->get('/finance/customer-groups')->assertRedirect('/login');
});

it('admin can list customer groups', function () {
    makeCustomerGroup();
    $this->get('/finance/customer-groups')->assertStatus(200);
});

it('staff with finance.view can list groups', function () {
    $this->actingAs($this->staff);
    $this->get('/finance/customer-groups')->assertStatus(200);
});

it('store creates a customer group', function () {
    $this->post('/finance/customer-groups', [
        'name'             => 'VIP Customers',
        'discount_percent' => 15.0,
        'currency'         => 'USD',
        'is_active'        => true,
    ])->assertRedirect();

    $group = CustomerGroup::where('name', 'VIP Customers')->first();
    expect($group)->not->toBeNull();
    expect($group->discount_percent)->toBe(15.0);
    expect($group->tenant_id)->toBe($this->tenant->id);
});

it('store validates required name', function () {
    $this->postJson('/finance/customer-groups', [
        'name' => '',
    ])->assertStatus(422)->assertJsonValidationErrors(['name']);
});

it('show displays group with member count', function () {
    $group   = makeCustomerGroup();
    $contact = makeGroupContact();
    $group->members()->attach($contact->id);

    $this->get("/finance/customer-groups/{$group->id}")->assertStatus(200);
    expect($group->member_count)->toBe(1);
});

it('update modifies the group', function () {
    $group = makeCustomerGroup(['name' => 'Old Name']);
    $this->put("/finance/customer-groups/{$group->id}", [
        'name'             => 'New Name',
        'discount_percent' => 20.0,
        'currency'         => 'EUR',
        'is_active'        => true,
    ])->assertRedirect();

    $fresh = $group->fresh();
    expect($fresh->name)->toBe('New Name');
    expect($fresh->discount_percent)->toBe(20.0);
    expect($fresh->currency)->toBe('EUR');
});

it('addMember attaches a contact to the group', function () {
    $group   = makeCustomerGroup();
    $contact = makeGroupContact();

    $this->post("/finance/customer-groups/{$group->id}/members", [
        'contact_id' => $contact->id,
    ])->assertRedirect();

    expect($group->members()->where('contacts.id', $contact->id)->exists())->toBeTrue();
});

it('removeMember detaches a contact from the group', function () {
    $group   = makeCustomerGroup();
    $contact = makeGroupContact();
    $group->members()->attach($contact->id);

    $this->delete("/finance/customer-groups/{$group->id}/members/{$contact->id}")
        ->assertRedirect();

    expect($group->members()->where('contacts.id', $contact->id)->exists())->toBeFalse();
});

it('calculateDiscount applies the correct discount', function () {
    $group = makeCustomerGroup(['discount_percent' => 10.0]);
    $discount = $group->calculateDiscount(200.0);
    expect($discount)->toBe(20.0);

    $group2 = makeCustomerGroup(['discount_percent' => 25.0]);
    expect($group2->calculateDiscount(400.0))->toBe(100.0);
});
