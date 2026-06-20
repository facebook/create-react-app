<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\Timesheet;
use App\Modules\HR\Models\TimesheetEntry;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'TS Co', 'slug' => 'ts-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

function makeTsApiEmployee(): Employee
{
    return Employee::create([
        'tenant_id'  => test()->tenant->id,
        'first_name' => 'TS',
        'last_name'  => 'Worker ' . uniqid(),
        'start_date' => now()->toDateString(),
        'status'     => 'active',
    ]);
}

function makeTsApiTimesheet(string $status = 'draft', ?Employee $emp = null): Timesheet
{
    $emp ??= makeTsApiEmployee();

    $ts = Timesheet::create([
        'tenant_id'   => test()->tenant->id,
        'employee_id' => $emp->id,
        'week_start'  => now()->startOfWeek()->toDateString(),
        'week_end'    => now()->endOfWeek()->toDateString(),
        'status'      => $status,
    ]);

    if ($status !== 'draft') {
        return $ts;
    }

    TimesheetEntry::create([
        'tenant_id'    => test()->tenant->id,
        'timesheet_id' => $ts->id,
        'work_date'    => now()->toDateString(),
        'hours'        => 8.0,
        'description'  => 'Regular work',
    ]);
    $ts->recalculateHours();

    return $ts;
}

test('can create a timesheet', function () {
    $emp = makeTsApiEmployee();

    $this->withToken($this->token)
        ->postJson('/api/v1/timesheets', [
            'employee_id' => $emp->id,
            'week_start'  => now()->startOfWeek()->toDateString(),
            'week_end'    => now()->endOfWeek()->toDateString(),
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.status', 'draft');
});

test('can list timesheets', function () {
    makeTsApiTimesheet();
    makeTsApiTimesheet('submitted');

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/timesheets')
        ->assertStatus(200);

    expect(count($response->json('data')))->toBeGreaterThanOrEqual(2);
});

test('can filter timesheets by status', function () {
    makeTsApiTimesheet('draft');
    makeTsApiTimesheet('submitted');

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/timesheets?status=draft')
        ->assertStatus(200);

    foreach ($response->json('data') as $item) {
        expect($item['status'])->toBe('draft');
    }
});

test('can view a timesheet', function () {
    $ts = makeTsApiTimesheet();

    $this->withToken($this->token)
        ->getJson("/api/v1/timesheets/{$ts->id}")
        ->assertStatus(200)
        ->assertJsonStructure(['data' => ['id', 'status', 'total_hours', 'entries', 'employee']]);
});

test('can add an entry to a draft timesheet', function () {
    $emp = makeTsApiEmployee();
    $ts  = Timesheet::create([
        'tenant_id'   => $this->tenant->id,
        'employee_id' => $emp->id,
        'week_start'  => now()->startOfWeek()->toDateString(),
        'week_end'    => now()->endOfWeek()->toDateString(),
        'status'      => 'draft',
    ]);

    $this->withToken($this->token)
        ->postJson("/api/v1/timesheets/{$ts->id}/entries", [
            'work_date'   => now()->toDateString(),
            'hours'       => 7.5,
            'project'     => 'ERP Build',
            'description' => 'API development',
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.hours', 7.5);

    expect((float) $ts->fresh()->total_hours)->toBe(7.5);
});

test('can remove an entry from a draft timesheet', function () {
    $ts    = makeTsApiTimesheet();
    $entry = $ts->entries->first();

    $this->withToken($this->token)
        ->deleteJson("/api/v1/timesheets/{$ts->id}/entries/{$entry->id}")
        ->assertStatus(200);

    expect(TimesheetEntry::find($entry->id))->toBeNull();
});

test('can submit a draft timesheet', function () {
    $ts = makeTsApiTimesheet('draft');

    $this->withToken($this->token)
        ->postJson("/api/v1/timesheets/{$ts->id}/submit")
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'submitted');
});

test('cannot submit an already submitted timesheet', function () {
    $ts = makeTsApiTimesheet('submitted');

    $this->withToken($this->token)
        ->postJson("/api/v1/timesheets/{$ts->id}/submit")
        ->assertStatus(422);
});

test('can approve a submitted timesheet', function () {
    $ts = makeTsApiTimesheet('submitted');

    $this->withToken($this->token)
        ->postJson("/api/v1/timesheets/{$ts->id}/approve")
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'approved');
});

test('can reject a submitted timesheet', function () {
    $ts = makeTsApiTimesheet('submitted');

    $this->withToken($this->token)
        ->postJson("/api/v1/timesheets/{$ts->id}/reject")
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'rejected');
});

test('can get timesheet summary', function () {
    makeTsApiTimesheet('draft');
    makeTsApiTimesheet('submitted');

    $this->withToken($this->token)
        ->getJson('/api/v1/timesheets/summary')
        ->assertStatus(200)
        ->assertJsonStructure(['data' => ['by_status', 'grand_total']]);
});

test('can delete a draft timesheet', function () {
    $ts = makeTsApiTimesheet();

    $this->withToken($this->token)
        ->deleteJson("/api/v1/timesheets/{$ts->id}")
        ->assertStatus(200);

    expect(Timesheet::withTrashed()->find($ts->id)?->deleted_at)->not->toBeNull();
});

test('requires authentication', function () {
    $this->getJson('/api/v1/timesheets')->assertStatus(401);
});
