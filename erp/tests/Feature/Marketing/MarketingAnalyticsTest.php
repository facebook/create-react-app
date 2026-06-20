<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Marketing\Models\AbTestVariant;
use App\Modules\Marketing\Models\CampaignEvent;
use App\Modules\Marketing\Models\EmailCampaign;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Analytics Corp', 'slug' => 'analytics-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

// ========================
// Helper functions
// ========================

function makeMktgCampaign(array $overrides = []): EmailCampaign
{
    return EmailCampaign::create(array_merge([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Analytics Campaign ' . uniqid(),
        'subject'   => 'Test Subject',
        'body_html' => '<p>Hello</p>',
        'status'    => 'sent',
    ], $overrides));
}

function makeMktgEvent(EmailCampaign $campaign, string $type, string $email = 'user@example.com'): CampaignEvent
{
    return CampaignEvent::create([
        'tenant_id'        => test()->tenant->id,
        'campaign_id'      => $campaign->id,
        'subscriber_email' => $email,
        'event_type'       => $type,
        'occurred_at'      => now(),
    ]);
}

function makeMktgVariant(EmailCampaign $campaign, array $overrides = []): AbTestVariant
{
    return AbTestVariant::create(array_merge([
        'tenant_id'       => test()->tenant->id,
        'campaign_id'     => $campaign->id,
        'name'            => 'Variant ' . uniqid(),
        'send_percentage' => 50,
        'sent'            => 100,
        'opens'           => 25,
        'clicks'          => 10,
    ], $overrides));
}

// ========================
// Tests
// ========================

// 1. Analytics index renders
it('analytics index renders', function () {
    $this->get('/marketing/analytics')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Marketing/Analytics/Index'));
});

// 2. Campaign stats endpoint returns JSON
it('campaign stats endpoint returns JSON', function () {
    $campaign = makeMktgCampaign();

    $this->getJson("/marketing/analytics/{$campaign->id}/stats")
        ->assertOk()
        ->assertJsonStructure(['campaign_id', 'stats' => ['sent', 'opened', 'clicked', 'bounced', 'unsubscribed', 'open_rate', 'click_rate']]);
});

// 3. Can track a sent event
it('can track a sent event', function () {
    $campaign = makeMktgCampaign();

    $this->postJson('/marketing/analytics/track', [
        'campaign_id'      => $campaign->id,
        'subscriber_email' => 'track@example.com',
        'event_type'       => 'sent',
    ])->assertOk()->assertJson(['success' => true]);

    expect(CampaignEvent::where('campaign_id', $campaign->id)->where('event_type', 'sent')->exists())->toBeTrue();
});

// 4. Can track an open event
it('can track an open event', function () {
    $campaign = makeMktgCampaign();

    $this->postJson('/marketing/analytics/track', [
        'campaign_id'      => $campaign->id,
        'subscriber_email' => 'opener@example.com',
        'event_type'       => 'opened',
    ])->assertOk()->assertJson(['success' => true]);

    expect(CampaignEvent::where('campaign_id', $campaign->id)->where('event_type', 'opened')->exists())->toBeTrue();
});

// 5. Track event validates required fields
it('track event validates required fields', function () {
    $this->postJson('/marketing/analytics/track', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['campaign_id', 'subscriber_email', 'event_type']);
});

// 6. Campaign stats correctly calculates open rate
it('campaign stats correctly calculates open rate', function () {
    $campaign = makeMktgCampaign();

    // Create 10 sent events and 3 opened events
    for ($i = 0; $i < 10; $i++) {
        makeMktgEvent($campaign, 'sent', "user{$i}@example.com");
    }
    for ($i = 0; $i < 3; $i++) {
        makeMktgEvent($campaign, 'opened', "user{$i}@example.com");
    }

    $response = $this->getJson("/marketing/analytics/{$campaign->id}/stats")
        ->assertOk();

    expect($response->json('stats.sent'))->toBe(10);
    expect($response->json('stats.opened'))->toBe(3);
    expect((float) $response->json('stats.open_rate'))->toBe(30.0);
});

// 7. Can store an A/B test variant
it('can store an AB test variant', function () {
    $campaign = makeMktgCampaign();

    $this->postJson("/marketing/campaigns/{$campaign->id}/ab-variants", [
        'name'            => 'Variant A',
        'subject_line'    => 'Hello from A',
        'send_percentage' => 50,
    ])->assertOk()->assertJson(['success' => true]);

    expect(AbTestVariant::where('campaign_id', $campaign->id)->where('name', 'Variant A')->exists())->toBeTrue();
});

// 8. A/B variant store validates send_percentage
it('AB variant store validates send percentage', function () {
    $campaign = makeMktgCampaign();

    $this->postJson("/marketing/campaigns/{$campaign->id}/ab-variants", [
        'name'            => 'Variant X',
        'send_percentage' => 150, // invalid: > 100
    ])->assertStatus(422)
      ->assertJsonValidationErrors(['send_percentage']);
});

// 9. Can declare a winner
it('can declare a winner', function () {
    $campaign = makeMktgCampaign();
    $variantA = makeMktgVariant($campaign, ['name' => 'A', 'is_winner' => false]);
    $variantB = makeMktgVariant($campaign, ['name' => 'B', 'is_winner' => false]);

    $this->postJson("/marketing/campaigns/{$campaign->id}/ab-variants/{$variantB->id}/winner")
        ->assertOk()
        ->assertJson(['success' => true]);

    expect($variantB->fresh()->is_winner)->toBeTrue();
    expect($variantA->fresh()->is_winner)->toBeFalse();
});

// 10. Analytics index shows correct sent/open/click counts per campaign
it('analytics index shows correct sent open click counts per campaign', function () {
    $campaign = makeMktgCampaign(['name' => 'Counted Campaign']);

    makeMktgEvent($campaign, 'sent', 'a@example.com');
    makeMktgEvent($campaign, 'sent', 'b@example.com');
    makeMktgEvent($campaign, 'opened', 'a@example.com');
    makeMktgEvent($campaign, 'clicked', 'a@example.com');

    $this->get('/marketing/analytics')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Marketing/Analytics/Index')
            ->where('campaigns.0.name', 'Counted Campaign')
            ->where('campaigns.0.sent', 2)
            ->where('campaigns.0.opens', 1)
            ->where('campaigns.0.clicks', 1)
        );
});
