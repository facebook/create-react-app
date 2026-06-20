<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\JobOfferLetter;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'OfferCorp', 'slug' => 'offer-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeOfferLetter(array $attrs = []): JobOfferLetter
{
    return JobOfferLetter::create([
        'tenant_id'       => test()->tenant->id,
        'candidate_name'  => 'Jane Doe',
        'candidate_email' => 'jane.' . uniqid() . '@example.com',
        'position_title'  => 'Software Engineer',
        'created_by'      => test()->admin->id,
        ...$attrs,
    ]);
}

it('index requires authentication', function () {
    $this->post('/logout');
    $this->get('/hr/job-offers')->assertRedirect('/login');
});

it('admin can list job offers', function () {
    makeOfferLetter();
    $this->get('/hr/job-offers')->assertOk();
});

it('store creates a job offer letter', function () {
    $this->post('/hr/job-offers', [
        'candidate_name'  => 'John Smith',
        'candidate_email' => 'john@example.com',
        'position_title'  => 'Product Manager',
        'offered_salary'  => 80000,
    ])->assertRedirect();

    expect(JobOfferLetter::where('candidate_email', 'john@example.com')->exists())->toBeTrue();
});

it('store validates required fields', function () {
    $this->postJson('/hr/job-offers', [])->assertStatus(422)->assertJsonValidationErrors(['candidate_name', 'candidate_email', 'position_title']);
});

it('show displays a job offer', function () {
    $offer = makeOfferLetter();
    $this->get("/hr/job-offers/{$offer->id}")->assertOk();
});

it('send transitions status to sent', function () {
    $offer = makeOfferLetter();
    expect($offer->status)->toBe('draft');

    $this->post("/hr/job-offers/{$offer->id}/send")->assertRedirect();

    $offer->refresh();
    expect($offer->status)->toBe('sent');
    expect($offer->sent_at)->not->toBeNull();
    expect($offer->is_pending)->toBeTrue();
});

it('accept transitions status to accepted', function () {
    $offer = makeOfferLetter(['status' => 'sent']);
    $this->post("/hr/job-offers/{$offer->id}/accept")->assertRedirect();
    $offer->refresh();
    expect($offer->status)->toBe('accepted');
    expect($offer->responded_at)->not->toBeNull();
});

it('decline transitions status to declined', function () {
    $offer = makeOfferLetter(['status' => 'sent']);
    $this->post("/hr/job-offers/{$offer->id}/decline")->assertRedirect();
    $offer->refresh();
    expect($offer->status)->toBe('declined');
});

it('is_expired accessor returns true for past expiry non-accepted offer', function () {
    $offer = makeOfferLetter([
        'status'            => 'sent',
        'offer_expiry_date' => now()->subDay()->toDateString(),
    ]);
    expect($offer->is_expired)->toBeTrue();
});

it('destroy soft-deletes the offer', function () {
    $offer = makeOfferLetter();
    $this->delete("/hr/job-offers/{$offer->id}")->assertRedirect();
    expect(JobOfferLetter::find($offer->id))->toBeNull();
    expect(JobOfferLetter::withTrashed()->find($offer->id))->not->toBeNull();
});
