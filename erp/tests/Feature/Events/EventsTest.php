<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Events\Models\Event;
use App\Modules\Events\Models\EventRegistration;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Events Corp', 'slug' => 'events-corp-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->actingAs($this->user);
    app()->instance('tenant', $this->tenant);
});

// Helper to create an event
function makeEvent(array $attrs = []): Event
{
    return Event::create(array_merge([
        'tenant_id' => test()->tenant->id,
        'title'     => 'Test Event ' . uniqid(),
        'starts_at' => now()->addDay(),
        'status'    => 'draft',
    ], $attrs));
}

// Helper to create a registration
function makeRegistration(Event $event, array $attrs = []): EventRegistration
{
    return EventRegistration::create(array_merge([
        'event_id'       => $event->id,
        'tenant_id'      => $event->tenant_id,
        'attendee_name'  => 'Attendee ' . uniqid(),
        'attendee_email' => 'attendee' . uniqid() . '@example.com',
        'status'         => 'registered',
        'registered_at'  => now(),
    ], $attrs));
}

// 1. Lists events
it('lists events', function () {
    makeEvent();
    $this->get('/events')->assertOk();
});

// 2. Creates an event
it('creates an event', function () {
    $this->post('/events', [
        'title'     => 'Annual Conference',
        'starts_at' => now()->addWeek()->format('Y-m-d H:i:s'),
    ])->assertRedirect();

    $event = Event::where('title', 'Annual Conference')->first();
    expect($event)->not->toBeNull();
    expect($event->status)->toBe('draft');
});

// 3. Shows an event
it('shows an event', function () {
    $event = makeEvent();
    $this->get("/events/{$event->id}")->assertOk();
});

// 4. Publishes an event
it('publishes an event', function () {
    $event = makeEvent(['status' => 'draft']);
    $this->post("/events/{$event->id}/publish")->assertRedirect();

    expect($event->fresh()->status)->toBe('published');
});

// 5. Cancels an event
it('cancels an event', function () {
    $event = makeEvent(['status' => 'published']);
    $this->post("/events/{$event->id}/cancel")->assertRedirect();

    expect($event->fresh()->status)->toBe('cancelled');
});

// 6. Registers for an event
it('registers for an event', function () {
    $event = makeEvent(['status' => 'published']);
    $this->post("/events/{$event->id}/register", [
        'attendee_name'  => 'Jane Doe',
        'attendee_email' => 'jane@example.com',
    ])->assertRedirect();

    $registration = EventRegistration::where('event_id', $event->id)->first();
    expect($registration)->not->toBeNull();
    expect($registration->attendee_name)->toBe('Jane Doe');
});

// 7. Cannot register for a cancelled event
it('cannot register for a cancelled event', function () {
    $event = makeEvent(['status' => 'cancelled']);
    $this->post("/events/{$event->id}/register", [
        'attendee_name'  => 'Jane Doe',
        'attendee_email' => 'jane@example.com',
    ])->assertStatus(422);
});

// 8. Rejects registration when event is full
it('rejects registration when event is full', function () {
    $event = makeEvent(['status' => 'published', 'capacity' => 1]);
    makeRegistration($event);

    $this->post("/events/{$event->id}/register", [
        'attendee_name'  => 'John Doe',
        'attendee_email' => 'john@example.com',
    ])->assertStatus(422);
});

// 9. Confirms a registration
it('confirms a registration', function () {
    $event        = makeEvent(['status' => 'published']);
    $registration = makeRegistration($event);

    $this->post("/events/{$event->id}/registrations/{$registration->id}/confirm")->assertRedirect();

    expect($registration->fresh()->status)->toBe('confirmed');
});

// 10. Marks a registration as attended
it('marks a registration as attended', function () {
    $event        = makeEvent(['status' => 'published']);
    $registration = makeRegistration($event);

    $this->post("/events/{$event->id}/registrations/{$registration->id}/attend")->assertRedirect();

    expect($registration->fresh()->status)->toBe('attended');
});
