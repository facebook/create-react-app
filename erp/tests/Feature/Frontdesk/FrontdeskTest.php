<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Frontdesk\Models\FrontdeskStation;
use App\Modules\Frontdesk\Models\VisitorLog;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Frontdesk Corp', 'slug' => 'frontdesk-corp-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->actingAs($this->user);
    app()->instance('tenant', $this->tenant);
});

function makeFrontdeskStation(array $overrides = []): FrontdeskStation
{
    return FrontdeskStation::create(array_merge([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Reception ' . uniqid(),
        'is_active' => true,
    ], $overrides));
}

function makeFrontdeskVisitor(array $overrides = []): VisitorLog
{
    return VisitorLog::create(array_merge([
        'tenant_id'    => test()->tenant->id,
        'visitor_name' => 'John Visitor ' . uniqid(),
        'status'       => 'expected',
    ], $overrides));
}

// 1. Dashboard renders
it('renders frontdesk dashboard', function () {
    $this->get('/frontdesk/dashboard')->assertOk()->assertInertia(fn ($page) => $page->component('Frontdesk/Dashboard'));
});

// 2. Stations index renders
it('renders frontdesk stations index', function () {
    $this->get('/frontdesk/stations')->assertOk()->assertInertia(fn ($page) => $page->component('Frontdesk/Stations/Index'));
});

// 3. Can create a station
it('can create a frontdesk station', function () {
    $this->post('/frontdesk/stations', ['name' => 'Main Reception'])->assertRedirect();
    expect(FrontdeskStation::where('name', 'Main Reception')->exists())->toBeTrue();
});

// 4. Visitors index renders
it('renders frontdesk visitors index', function () {
    $this->get('/frontdesk/visitors')->assertOk()->assertInertia(fn ($page) => $page->component('Frontdesk/Visitors/Index'));
});

// 5. Check-in page renders
it('renders frontdesk check-in page', function () {
    $this->get('/frontdesk/check-in')->assertOk()->assertInertia(fn ($page) => $page->component('Frontdesk/CheckIn'));
});

// 6. Can check in a walk-in visitor
it('can check in a walk-in visitor', function () {
    $this->post('/frontdesk/check-in', [
        'visitor_name' => 'Jane Walkin',
    ])->assertRedirect();

    expect(VisitorLog::where('visitor_name', 'Jane Walkin')->where('status', 'checked_in')->exists())->toBeTrue();
});

// 7. Can check out a visitor
it('can check out a visitor', function () {
    $visitor = makeFrontdeskVisitor(['status' => 'checked_in', 'check_in_at' => now()]);

    $this->post("/frontdesk/visitors/{$visitor->id}/check-out")->assertRedirect();

    expect($visitor->fresh()->status)->toBe('checked_out');
});

// 8. Can mark no-show
it('can mark visitor as no-show', function () {
    $visitor = makeFrontdeskVisitor(['status' => 'expected']);

    $this->post("/frontdesk/visitors/{$visitor->id}/no-show")->assertRedirect();

    expect($visitor->fresh()->status)->toBe('no_show');
});

// 9. Can pre-register a visitor
it('can pre-register a visitor', function () {
    $expectedAt = now()->addHour()->toDateTimeString();

    $this->post('/frontdesk/pre-register', [
        'visitor_name' => 'Pre Registered Visitor',
        'expected_at'  => $expectedAt,
    ])->assertRedirect();

    expect(VisitorLog::where('visitor_name', 'Pre Registered Visitor')->where('status', 'expected')->exists())->toBeTrue();
});

// 10. generateBadge returns correct format
it('generateBadge returns correct format', function () {
    $visitor = makeFrontdeskVisitor(['visitor_name' => 'Alice Wonder']);

    $badge = $visitor->generateBadge();

    expect($badge)->toStartWith('VIS-');
    expect($badge)->toMatch('/^VIS-[A-Z]{3}-\d{4}$/');
});
