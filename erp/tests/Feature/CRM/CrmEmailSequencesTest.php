<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\CRM\Models\CrmLead;
use App\Modules\CRM\Models\EmailSequence;
use App\Modules\CRM\Models\EmailSequenceEnrollment;
use App\Modules\CRM\Models\EmailSequenceStep;
use App\Modules\CRM\Models\LeadScoringRule;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'CRM Sequences Co', 'slug' => 'crm-seq-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeSequence(): EmailSequence
{
    return EmailSequence::create([
        'tenant_id' => app('tenant')->id,
        'name'      => 'Onboarding Sequence',
        'status'    => 'active',
    ]);
}

function makeEmailLead(): CrmLead
{
    return CrmLead::create([
        'tenant_id'    => app('tenant')->id,
        'title'        => 'Jane Smith — Website Lead',
        'contact_name' => 'Jane Smith',
        'email'        => 'jane@example.com',
        'source'       => 'website',
        'status'       => 'open',
        'created_by'   => auth()->id(),
    ]);
}

test('email sequences index renders', function () {
    $response = $this->get('/crm/sequences');
    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('CRM/EmailSequences/Index'));
});

test('can create an email sequence', function () {
    $response = $this->post('/crm/sequences', [
        'name'        => 'Cold Outreach',
        'description' => 'A 5-step cold email campaign',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('email_sequences', ['name' => 'Cold Outreach', 'tenant_id' => $this->tenant->id]);
});

test('sequence show page renders', function () {
    $seq = makeSequence();

    $response = $this->get("/crm/sequences/{$seq->id}");
    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('CRM/EmailSequences/Show'));
});

test('can add step to sequence', function () {
    $seq = makeSequence();

    $this->post("/crm/sequences/{$seq->id}/steps", [
        'subject'    => 'Welcome to our platform!',
        'body'       => 'Hi there, thanks for signing up...',
        'delay_days' => 0,
    ]);

    $this->assertDatabaseHas('email_sequence_steps', [
        'sequence_id' => $seq->id,
        'subject'     => 'Welcome to our platform!',
    ]);

    $seq->refresh();
    expect($seq->total_steps)->toBe(1);
});

test('can enroll lead in sequence', function () {
    $seq  = makeSequence();
    $lead = makeEmailLead();

    $this->post("/crm/sequences/{$seq->id}/enroll", ['lead_id' => $lead->id]);

    $this->assertDatabaseHas('email_sequence_enrollments', [
        'sequence_id' => $seq->id,
        'lead_id'     => $lead->id,
        'status'      => 'active',
    ]);
});

test('enrolling same lead twice does not duplicate', function () {
    $seq  = makeSequence();
    $lead = makeEmailLead();

    $this->post("/crm/sequences/{$seq->id}/enroll", ['lead_id' => $lead->id]);
    $this->post("/crm/sequences/{$seq->id}/enroll", ['lead_id' => $lead->id]);

    $count = EmailSequenceEnrollment::where('sequence_id', $seq->id)->where('lead_id', $lead->id)->count();
    expect($count)->toBe(1);
});

test('can pause and activate sequence', function () {
    $seq = makeSequence();

    $this->post("/crm/sequences/{$seq->id}/pause");
    $seq->refresh();
    expect($seq->status)->toBe('paused');

    $this->post("/crm/sequences/{$seq->id}/activate");
    $seq->refresh();
    expect($seq->status)->toBe('active');
});

test('can unsubscribe from sequence', function () {
    $seq        = makeSequence();
    $lead       = makeEmailLead();
    $enrollment = EmailSequenceEnrollment::create([
        'tenant_id'   => $this->tenant->id,
        'sequence_id' => $seq->id,
        'lead_id'     => $lead->id,
        'status'      => 'active',
    ]);

    $this->post("/crm/enrollments/{$enrollment->id}/unsubscribe");

    $enrollment->refresh();
    expect($enrollment->status)->toBe('unsubscribed');
});

test('lead scoring rules page renders', function () {
    $response = $this->get('/crm/scoring/rules');
    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('CRM/LeadScoring/Rules'));
});

test('can create lead scoring rule', function () {
    $response = $this->post('/crm/scoring/rules', [
        'name'            => 'Website Lead',
        'field'           => 'source',
        'condition_value' => 'website',
        'points'          => 20,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('lead_scoring_rules', ['name' => 'Website Lead', 'points' => 20]);
});

test('lead scoring calculates correctly', function () {
    LeadScoringRule::create(['tenant_id' => $this->tenant->id, 'name' => 'Website', 'field' => 'source', 'condition_value' => 'website', 'points' => 30, 'is_active' => true]);
    LeadScoringRule::create(['tenant_id' => $this->tenant->id, 'name' => 'Inactive', 'field' => 'source', 'condition_value' => 'website', 'points' => 100, 'is_active' => false]);

    $lead  = makeEmailLead(); // source = website
    $score = LeadScoringRule::scoreForLead($lead);

    expect($score)->toBe(30);
});

test('scores page renders with lead scores', function () {
    LeadScoringRule::create(['tenant_id' => $this->tenant->id, 'name' => 'Base', 'field' => 'source', 'condition_value' => 'website', 'points' => 10, 'is_active' => true]);
    makeEmailLead();

    $response = $this->get('/crm/scoring/scores');
    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('CRM/LeadScoring/Scores')
        ->has('leads')
    );
});
