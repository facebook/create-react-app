<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Commission;
use App\Modules\Finance\Models\CommissionRule;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Invoice;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Comm Co', 'slug' => 'comm-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

function createInvoiceForComm(): Invoice
{
    $contact = Contact::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Client ' . uniqid(),
        'type'      => 'customer',
    ]);
    return Invoice::create([
        'tenant_id'  => test()->tenant->id,
        'contact_id' => $contact->id,
        'issue_date' => now()->toDateString(),
        'due_date'   => now()->addDays(30)->toDateString(),
        'status'     => 'sent',
    ]);
}

test('can create a commission rule', function () {
    $this->withToken($this->token)
        ->postJson('/api/v1/commissions/rules', [
            'user_id' => $this->user->id,
            'name'    => '10% Sales Commission',
            'type'    => 'percentage',
            'rate'    => 0.10,
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.name', '10% Sales Commission');
});

test('can list commission rules', function () {
    CommissionRule::create([
        'tenant_id' => $this->tenant->id,
        'user_id'   => $this->user->id,
        'name'      => 'Standard Rate',
        'type'      => 'percentage',
        'rate'      => 0.05,
        'is_active' => true,
    ]);

    $this->withToken($this->token)
        ->getJson('/api/v1/commissions/rules')
        ->assertStatus(200)
        ->assertJsonStructure(['data']);
});

test('can calculate commission for an invoice', function () {
    $rule    = CommissionRule::create([
        'tenant_id' => $this->tenant->id,
        'user_id'   => $this->user->id,
        'name'      => '5% Rule',
        'type'      => 'percentage',
        'rate'      => 0.05,
        'is_active' => true,
    ]);

    $invoice = createInvoiceForComm();

    $this->withToken($this->token)
        ->postJson('/api/v1/commissions/calculate', [
            'invoice_id'         => $invoice->id,
            'commission_rule_id' => $rule->id,
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.status', 'pending');

    expect(Commission::where('invoice_id', $invoice->id)->exists())->toBeTrue();
});

test('can approve a commission', function () {
    $rule = CommissionRule::create([
        'tenant_id' => $this->tenant->id,
        'user_id'   => $this->user->id,
        'name'      => 'Fixed $50',
        'type'      => 'fixed',
        'fixed_amount' => 50.00,
        'is_active' => true,
    ]);

    $invoice = createInvoiceForComm();

    $commission = Commission::create([
        'tenant_id'          => $this->tenant->id,
        'commission_rule_id' => $rule->id,
        'user_id'            => $this->user->id,
        'invoice_id'         => $invoice->id,
        'invoice_amount'     => 1000.00,
        'commission_amount'  => 50.00,
        'status'             => 'pending',
    ]);

    $this->withToken($this->token)
        ->postJson("/api/v1/commissions/{$commission->id}/approve")
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'approved');

    expect($commission->fresh()->approved_at)->not->toBeNull();
});

test('can mark commission as paid', function () {
    $rule2 = CommissionRule::create([
        'tenant_id' => $this->tenant->id,
        'user_id'   => $this->user->id,
        'name'      => 'Paid Rule',
        'type'      => 'fixed',
        'fixed_amount' => 25.00,
        'is_active' => true,
    ]);

    $invoice2 = createInvoiceForComm();

    $commission = Commission::create([
        'tenant_id'          => $this->tenant->id,
        'commission_rule_id' => $rule2->id,
        'user_id'            => $this->user->id,
        'invoice_id'         => $invoice2->id,
        'invoice_amount'     => 500.00,
        'commission_amount'  => 25.00,
        'status'             => 'approved',
    ]);

    $this->withToken($this->token)
        ->postJson("/api/v1/commissions/{$commission->id}/mark-paid")
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'paid');
});

test('summary shows commissions grouped by user', function () {
    $rule = CommissionRule::create([
        'tenant_id'    => $this->tenant->id,
        'user_id'      => $this->user->id,
        'name'         => 'Test Rule',
        'type'         => 'fixed',
        'fixed_amount' => 100.00,
        'is_active'    => true,
    ]);

    $invoice3 = createInvoiceForComm();

    Commission::create([
        'tenant_id'          => $this->tenant->id,
        'commission_rule_id' => $rule->id,
        'user_id'            => $this->user->id,
        'invoice_id'         => $invoice3->id,
        'invoice_amount'     => 2000.00,
        'commission_amount'  => 100.00,
        'status'             => 'pending',
    ]);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/commissions/summary')
        ->assertStatus(200)
        ->assertJsonStructure(['data' => ['period', 'total_pending', 'total_paid', 'by_user']]);

    expect((float) $response->json('data.total_pending'))->toBe(100.0);
    expect($response->json('data.by_user'))->not->toBeEmpty();
});

test('validates commission rule type', function () {
    $this->withToken($this->token)
        ->postJson('/api/v1/commissions/rules', [
            'user_id' => $this->user->id,
            'name'    => 'Bad Type',
            'type'    => 'tiered',
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['type']);
});

test('requires authentication', function () {
    $this->getJson('/api/v1/commissions')->assertStatus(401);
});
