<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Lead;
use App\Modules\Finance\Models\LeadActivity;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'CRM Co', 'slug' => 'crm-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeLead(string $stage = 'new'): Lead
{
    return Lead::create([
        'tenant_id'       => app('tenant')->id,
        'name'            => 'Acme Corp',
        'email'           => 'lead@acme.com',
        'source'          => 'website',
        'stage'           => $stage,
        'probability'     => 20,
        'estimated_value' => 10000,
    ]);
}

test('admin can list leads', function () {
    $this->get('/finance/leads')
        ->assertStatus(200);
});

test('admin can create a lead', function () {
    $this->post('/finance/leads', [
        'name'   => 'New Prospect',
        'source' => 'website',
        'stage'  => 'new',
    ])->assertRedirect();

    expect(Lead::where('name', 'New Prospect')->where('tenant_id', $this->tenant->id)->exists())->toBeTrue();
});

test('store requires name and source', function () {
    $this->postJson('/finance/leads', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'source']);
});

test('admin can view a lead', function () {
    $lead = makeLead();

    $this->get("/finance/leads/{$lead->id}")
        ->assertStatus(200);
});

test('admin can update a lead stage', function () {
    $lead = makeLead();

    $this->patch("/finance/leads/{$lead->id}", [
        'stage'       => 'contacted',
        'probability' => 30,
    ])->assertRedirect();

    expect($lead->fresh()->stage)->toBe('contacted');
});

test('admin can mark a lead as won', function () {
    $lead = makeLead();

    $this->post("/finance/leads/{$lead->id}/mark-won")
        ->assertRedirect();

    $lead->refresh();
    expect($lead->stage)->toBe('won');
    expect($lead->won_at->toDateString())->toBe(today()->toDateString());
    expect($lead->probability)->toBe(100);
});

test('admin can mark a lead as lost', function () {
    $lead = makeLead();

    $this->post("/finance/leads/{$lead->id}/mark-lost", [
        'reason' => 'Budget constraints',
    ])->assertRedirect();

    $lead->refresh();
    expect($lead->stage)->toBe('lost');
    expect($lead->lost_reason)->toBe('Budget constraints');
});

test('admin can add an activity', function () {
    $lead = makeLead();

    $this->post("/finance/leads/{$lead->id}/activities", [
        'type'          => 'call',
        'description'   => 'Initial discovery call',
        'activity_date' => today()->toDateString(),
    ])->assertRedirect();

    expect(LeadActivity::where('lead_id', $lead->id)->where('type', 'call')->exists())->toBeTrue();
});

test('weighted_value accessor is correct', function () {
    $lead = Lead::create([
        'tenant_id'       => app('tenant')->id,
        'name'            => 'Weighted Test',
        'source'          => 'referral',
        'stage'           => 'new',
        'estimated_value' => 10000,
        'probability'     => 60,
    ]);

    expect($lead->weighted_value)->toBe(6000.0);
});

test('staff cannot delete a lead', function () {
    $lead = makeLead();

    $this->actingAs($this->staff)
        ->delete("/finance/leads/{$lead->id}")
        ->assertStatus(403);
});
