<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Marketing\Models\CampaignSend;
use App\Modules\Marketing\Models\EmailCampaign;
use App\Modules\Marketing\Models\MailingList;
use App\Modules\Marketing\Models\Subscriber;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Marketing Corp', 'slug' => 'marketing-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeMailingList(array $attrs = []): MailingList
{
    return MailingList::create(array_merge([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Test List ' . uniqid(),
        'is_active' => true,
    ], $attrs));
}

function makeSubscriber(array $attrs = []): Subscriber
{
    return Subscriber::create(array_merge([
        'tenant_id'     => test()->tenant->id,
        'email'         => 'test-' . uniqid() . '@example.com',
        'status'        => 'subscribed',
        'subscribed_at' => now(),
    ], $attrs));
}

function makeCampaign(array $attrs = []): EmailCampaign
{
    return EmailCampaign::create(array_merge([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Test Campaign ' . uniqid(),
        'subject'   => 'Hello World',
        'body_html' => '<p>Hello!</p>',
        'status'    => 'draft',
    ], $attrs));
}

// ---- Dashboard ----

it('renders marketing dashboard', function () {
    $this->get('/marketing/dashboard')->assertOk();
});

// ---- Mailing Lists ----

it('renders mailing lists index', function () {
    $this->get('/marketing/mailing-lists')->assertOk();
});

it('renders mailing list create page', function () {
    $this->get('/marketing/mailing-lists/create')->assertOk();
});

it('stores a mailing list', function () {
    $this->post('/marketing/mailing-lists', [
        'name'      => 'Newsletter ' . uniqid(),
        'is_active' => true,
    ])->assertRedirect('/marketing/mailing-lists');

    expect(MailingList::where('tenant_id', $this->tenant->id)->exists())->toBeTrue();
});

it('shows a mailing list', function () {
    $list = makeMailingList();
    $this->get("/marketing/mailing-lists/{$list->id}")->assertOk();
});

it('renders mailing list edit page', function () {
    $list = makeMailingList();
    $this->get("/marketing/mailing-lists/{$list->id}/edit")->assertOk();
});

it('updates a mailing list', function () {
    $list = makeMailingList();
    $this->put("/marketing/mailing-lists/{$list->id}", [
        'name'      => 'Updated List',
        'is_active' => false,
    ])->assertRedirect('/marketing/mailing-lists');

    expect($list->fresh()->name)->toBe('Updated List');
});

it('destroys a mailing list', function () {
    $list = makeMailingList();
    $this->delete("/marketing/mailing-lists/{$list->id}")->assertRedirect('/marketing/mailing-lists');

    expect(MailingList::find($list->id))->toBeNull();
});

it('adds subscriber to mailing list', function () {
    $list = makeMailingList();
    $this->post("/marketing/mailing-lists/{$list->id}/add-subscriber", [
        'email' => 'newuser@example.com',
        'name'  => 'New User',
    ])->assertRedirect();

    expect($list->subscribers()->where('email', 'newuser@example.com')->exists())->toBeTrue();
});

it('removes subscriber from mailing list', function () {
    $list       = makeMailingList();
    $subscriber = makeSubscriber();
    $list->subscribers()->attach($subscriber->id);

    $this->delete("/marketing/mailing-lists/{$list->id}/subscribers/{$subscriber->id}")
        ->assertRedirect();

    expect($list->subscribers()->where('subscribers.id', $subscriber->id)->exists())->toBeFalse();
});

// ---- Subscribers ----

it('renders subscribers index', function () {
    $this->get('/marketing/subscribers')->assertOk();
});

it('stores a subscriber', function () {
    $this->post('/marketing/subscribers', [
        'email' => 'brand-new@example.com',
        'name'  => 'Brand New',
    ])->assertRedirect();

    expect(Subscriber::where('email', 'brand-new@example.com')->exists())->toBeTrue();
});

it('unsubscribes a subscriber', function () {
    $subscriber = makeSubscriber(['status' => 'subscribed']);
    $this->post("/marketing/subscribers/{$subscriber->id}/unsubscribe")->assertRedirect();

    expect($subscriber->fresh()->status)->toBe('unsubscribed');
});

it('destroys a subscriber', function () {
    $subscriber = makeSubscriber();
    $this->delete("/marketing/subscribers/{$subscriber->id}")->assertRedirect();

    expect(Subscriber::find($subscriber->id))->toBeNull();
});

// ---- Campaigns ----

it('renders campaigns index', function () {
    $this->get('/marketing/campaigns')->assertOk();
});

it('renders campaign create page', function () {
    $this->get('/marketing/campaigns/create')->assertOk();
});

it('stores a campaign', function () {
    $this->post('/marketing/campaigns', [
        'name'      => 'My Campaign',
        'subject'   => 'Hello Subscribers',
        'body_html' => '<p>Test body</p>',
    ])->assertRedirect();

    expect(EmailCampaign::where('name', 'My Campaign')->exists())->toBeTrue();
});

it('shows a campaign', function () {
    $campaign = makeCampaign();
    $this->get("/marketing/campaigns/{$campaign->id}")->assertOk();
});

it('renders campaign edit page', function () {
    $campaign = makeCampaign();
    $this->get("/marketing/campaigns/{$campaign->id}/edit")->assertOk();
});

it('updates a campaign', function () {
    $campaign = makeCampaign();
    $this->put("/marketing/campaigns/{$campaign->id}", [
        'name'      => 'Updated Campaign',
        'subject'   => 'Updated Subject',
        'body_html' => '<p>Updated</p>',
    ])->assertRedirect();

    expect($campaign->fresh()->name)->toBe('Updated Campaign');
});

it('sends a campaign and creates campaign send records', function () {
    $list       = makeMailingList();
    $subscriber = makeSubscriber();
    $list->subscribers()->attach($subscriber->id);

    $campaign = makeCampaign(['mailing_list_id' => $list->id]);
    $this->post("/marketing/campaigns/{$campaign->id}/send")->assertRedirect();

    $campaign->refresh();
    expect($campaign->status)->toBe('sent');
    expect(CampaignSend::where('campaign_id', $campaign->id)->count())->toBe(1);
});

it('cancels a campaign', function () {
    $campaign = makeCampaign();
    $this->post("/marketing/campaigns/{$campaign->id}/cancel")->assertRedirect();

    expect($campaign->fresh()->status)->toBe('cancelled');
});

// ---- Rates ----

it('calculates open and click rates correctly', function () {
    $campaign = makeCampaign([
        'status'     => 'sent',
        'sent_count' => 100,
        'open_count' => 25,
        'click_count' => 10,
    ]);

    expect($campaign->openRate())->toBe(25.0);
    expect($campaign->clickRate())->toBe(10.0);
});
