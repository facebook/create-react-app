<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contract;
use App\Modules\Finance\Models\ContractRenewal;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Contract Co', 'slug' => 'contract-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeContract(string $status = 'draft'): Contract
{
    return Contract::create([
        'tenant_id'       => test()->tenant->id,
        'contract_number' => 'CNT-' . uniqid(),
        'title'           => 'Service Agreement',
        'party_name'      => 'Acme Corp',
        'type'            => 'client',
        'status'          => $status,
        'start_date'      => now()->toDateString(),
        'end_date'        => now()->addYear()->toDateString(),
        'created_by'      => test()->admin->id,
    ]);
}

it('admin can list contracts', function () {
    $this->get('/finance/contracts')->assertStatus(200);
});

it('admin can create a contract', function () {
    $this->post('/finance/contracts', [
        'title'      => 'New Deal',
        'party_name' => 'Partner Ltd',
        'type'       => 'vendor',
        'start_date' => now()->toDateString(),
        'end_date'   => now()->addMonths(6)->toDateString(),
    ])->assertRedirect();
    expect(Contract::where('title', 'New Deal')->exists())->toBeTrue();
});

it('contract store requires title, party_name, start_date, end_date', function () {
    $this->postJson('/finance/contracts', [])->assertStatus(422)
        ->assertJsonValidationErrors(['title', 'party_name', 'start_date', 'end_date']);
});

it('admin can view a contract', function () {
    $contract = makeContract();
    $this->get("/finance/contracts/{$contract->id}")->assertStatus(200);
});

it('admin can activate a contract', function () {
    $contract = makeContract('draft');
    $this->post("/finance/contracts/{$contract->id}/activate")->assertRedirect();
    expect($contract->fresh()->status)->toBe('active');
    expect($contract->fresh()->signed_at)->not->toBeNull();
});

it('admin can terminate a contract', function () {
    $contract = makeContract('active');
    $this->post("/finance/contracts/{$contract->id}/terminate", ['notes' => 'Early exit'])->assertRedirect();
    expect($contract->fresh()->status)->toBe('terminated');
    expect($contract->fresh()->terminated_at)->not->toBeNull();
});

it('admin can renew a contract', function () {
    $contract = makeContract('active');
    $newEnd   = now()->addYears(2)->toDateString();
    $this->post("/finance/contracts/{$contract->id}/renew", [
        'new_end_date' => $newEnd,
        'new_value'    => 50000,
        'notes'        => 'Extended',
    ])->assertRedirect();
    expect($contract->fresh()->end_date->toDateString())->toBe($newEnd);
    expect(ContractRenewal::where('contract_id', $contract->id)->count())->toBe(1);
});

it('is_expiring returns true when end_date within 30 days', function () {
    $contract = makeContract('active');
    \Illuminate\Support\Facades\DB::table('contracts')
        ->where('id', $contract->id)
        ->update(['end_date' => now()->addDays(15)->toDateString()]);
    expect($contract->fresh()->is_expiring)->toBeTrue();
});

it('days_remaining returns correct count', function () {
    $contract = makeContract();
    \Illuminate\Support\Facades\DB::table('contracts')
        ->where('id', $contract->id)
        ->update(['end_date' => now()->addDays(10)->toDateString()]);
    expect($contract->fresh()->days_remaining)->toBe(10);
});

it('staff cannot delete a contract', function () {
    $contract = makeContract();
    $this->actingAs($this->staff)
        ->delete("/finance/contracts/{$contract->id}")
        ->assertStatus(403);
});
