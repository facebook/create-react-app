<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Commission;
use App\Modules\Finance\Models\CommissionRule;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\InvoiceItem;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Comm Co', 'slug' => 'comm-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeSalesRep(): User
{
    $rep = User::factory()->create(['tenant_id' => test()->tenant->id]);
    $rep->assignRole('staff');
    return $rep;
}

function makeCommRule(User $rep, string $type = 'percentage', float $rate = 0.05): CommissionRule
{
    return CommissionRule::create([
        'tenant_id' => test()->tenant->id,
        'user_id'   => $rep->id,
        'name'      => 'Standard ' . $type,
        'type'      => $type,
        'rate'      => $rate,
        'is_active' => true,
    ]);
}

function makeCommInvoice(float $total = 1000.0): Invoice
{
    $contact = Contact::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Comm Customer',
        'type'      => 'customer',
    ]);
    $invoice = Invoice::create([
        'tenant_id'  => test()->tenant->id,
        'contact_id' => $contact->id,
        'status'     => 'paid',
        'issue_date' => now()->toDateString(),
        'due_date'   => now()->addDays(30)->toDateString(),
    ]);
    InvoiceItem::create([
        'invoice_id'  => $invoice->id,
        'description' => 'Service',
        'quantity'    => 1,
        'unit_price'  => $total,
        'tax_rate'    => 0,
    ]);
    return $invoice->load('items', 'payments');
}

it('admin can list commissions', function () {
    $this->get('/finance/commissions')->assertStatus(200);
});

it('admin can list commission rules', function () {
    $this->get('/finance/commission-rules')->assertStatus(200);
});

it('admin can create commission rule', function () {
    $rep = makeSalesRep();
    $this->post('/finance/commission-rules', [
        'user_id' => $rep->id,
        'name'    => 'Test Rule',
        'type'    => 'percentage',
        'rate'    => 0.1,
    ])->assertRedirect();
    expect(CommissionRule::where('name', 'Test Rule')->exists())->toBeTrue();
});

it('calculateCommission percentage works', function () {
    $rep = makeSalesRep();
    $rule = makeCommRule($rep, 'percentage', 0.05);
    expect($rule->calculateCommission(1000.0))->toBe(50.0);
});

it('calculateCommission fixed works', function () {
    $rep = makeSalesRep();
    $rule = CommissionRule::create([
        'tenant_id'    => test()->tenant->id,
        'user_id'      => $rep->id,
        'name'         => 'Fixed Rule',
        'type'         => 'fixed',
        'rate'         => 0,
        'fixed_amount' => 75.0,
        'is_active'    => true,
    ]);
    expect($rule->calculateCommission(5000.0))->toBe(75.0);
});

it('admin can create a commission manually', function () {
    $rep = makeSalesRep();
    $rule = makeCommRule($rep);
    $invoice = makeCommInvoice(2000.0);

    $this->post('/finance/commissions', [
        'commission_rule_id' => $rule->id,
        'invoice_id'         => $invoice->id,
    ])->assertRedirect();
    $comm = Commission::where('invoice_id', $invoice->id)->first();
    expect($comm)->not->toBeNull();
    expect((float)$comm->commission_amount)->toBe(100.0); // 5% of 2000
});

it('admin can approve commission', function () {
    $rep = makeSalesRep();
    $rule = makeCommRule($rep);
    $invoice = makeCommInvoice();
    $comm = Commission::create([
        'tenant_id'          => test()->tenant->id,
        'commission_rule_id' => $rule->id,
        'user_id'            => $rep->id,
        'invoice_id'         => $invoice->id,
        'invoice_amount'     => 1000,
        'commission_amount'  => 50,
        'status'             => 'pending',
    ]);
    $this->post("/finance/commissions/{$comm->id}/approve");
    expect($comm->fresh()->status)->toBe('approved');
    expect($comm->fresh()->approved_at)->not->toBeNull();
});

it('admin can mark commission as paid', function () {
    $rep = makeSalesRep();
    $rule = makeCommRule($rep);
    $invoice = makeCommInvoice();
    $comm = Commission::create([
        'tenant_id'          => test()->tenant->id,
        'commission_rule_id' => $rule->id,
        'user_id'            => $rep->id,
        'invoice_id'         => $invoice->id,
        'invoice_amount'     => 1000,
        'commission_amount'  => 50,
        'status'             => 'approved',
    ]);
    $this->post("/finance/commissions/{$comm->id}/mark-paid");
    expect($comm->fresh()->status)->toBe('paid');
});

it('staff cannot delete commission rule', function () {
    $rep = makeSalesRep();
    $rule = makeCommRule($rep);
    $this->actingAs($this->staff)
        ->delete("/finance/commission-rules/{$rule->id}")
        ->assertStatus(403);
});

it('generate creates commission from invoice assignment', function () {
    $rep = makeSalesRep();
    $rule = makeCommRule($rep, 'percentage', 0.10);
    $invoice = makeCommInvoice(500.0);
    $invoice->update(['assigned_to_user_id' => $rep->id]);

    $this->post('/finance/commissions/generate', [
        'invoice_id' => $invoice->id,
    ])->assertRedirect();

    $comm = Commission::where('invoice_id', $invoice->id)->first();
    expect($comm)->not->toBeNull();
    expect((float)$comm->commission_amount)->toBe(50.0);
});
