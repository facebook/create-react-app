<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\LeaveRequest;
use App\Modules\HR\Models\LeaveType;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Self Service Co', 'slug' => 'ss-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);

    $this->employee = Employee::create([
        'tenant_id'       => $this->tenant->id,
        'user_id'         => $this->user->id,
        'first_name'      => 'Jane',
        'last_name'       => 'Doe',
        'employee_number' => 'EMP-SS-' . uniqid(),
        'email'           => 'jane-' . uniqid() . '@example.com',
        'position'        => 'Designer',
        'status'          => 'active',
        'hire_date'       => now()->subYear()->toDateString(),
    ]);
});

test('can get own employee profile', function () {
    $this->withToken($this->token)
        ->getJson('/api/v1/me')
        ->assertStatus(200)
        ->assertJsonPath('data.first_name', 'Jane')
        ->assertJsonPath('data.last_name', 'Doe');
});

test('returns 404 when no employee linked', function () {
    $newUser  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $newToken = $newUser->createToken('test')->plainTextToken;

    $this->withToken($newToken)
        ->getJson('/api/v1/me')
        ->assertStatus(404);
});

test('can update own phone number', function () {
    $this->withToken($this->token)
        ->putJson('/api/v1/me', ['phone' => '+44 20 7946 0958'])
        ->assertStatus(200);

    expect($this->employee->fresh()->phone)->toBe('+44 20 7946 0958');
});

test('can get self-service summary', function () {
    $response = $this->withToken($this->token)
        ->getJson('/api/v1/me/summary')
        ->assertStatus(200);

    expect($response->json('data.name'))->toBe('Jane Doe');
    expect($response->json('data.pending_leave_requests'))->toBe(0);
});

test('can list own leave requests', function () {
    $leaveType = LeaveType::create([
        'tenant_id'   => $this->tenant->id,
        'name'        => 'Annual',
        'code'        => 'AL',
        'default_days' => 20,
    ]);

    LeaveRequest::create([
        'tenant_id'     => $this->tenant->id,
        'employee_id'   => $this->employee->id,
        'leave_type_id' => $leaveType->id,
        'start_date'    => now()->addDays(5)->toDateString(),
        'end_date'      => now()->addDays(7)->toDateString(),
        'days'          => 3,
        'status'        => 'pending',
    ]);

    $this->withToken($this->token)
        ->getJson('/api/v1/me/leave-requests')
        ->assertStatus(200)
        ->assertJsonStructure(['data', 'meta']);
});

test('can apply for leave', function () {
    $leaveType = LeaveType::create([
        'tenant_id'   => $this->tenant->id,
        'name'        => 'Sick',
        'code'        => 'SL',
        'default_days' => 10,
    ]);

    $this->withToken($this->token)
        ->postJson('/api/v1/me/leave-requests', [
            'leave_type_id' => $leaveType->id,
            'start_date'    => now()->addDays(2)->toDateString(),
            'end_date'      => now()->addDays(3)->toDateString(),
            'reason'        => 'Medical appointment',
        ])
        ->assertStatus(201);

    expect(LeaveRequest::where('employee_id', $this->employee->id)->exists())->toBeTrue();
});

test('leave application validates start date not in past', function () {
    $leaveType = LeaveType::create([
        'tenant_id'   => $this->tenant->id,
        'name'        => 'Annual',
        'code'        => 'AN2',
        'default_days' => 20,
    ]);

    $this->withToken($this->token)
        ->postJson('/api/v1/me/leave-requests', [
            'leave_type_id' => $leaveType->id,
            'start_date'    => now()->subDays(3)->toDateString(),
            'end_date'      => now()->subDays(1)->toDateString(),
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['start_date']);
});

test('can list own expense claims', function () {
    $this->withToken($this->token)
        ->getJson('/api/v1/me/expense-claims')
        ->assertStatus(200)
        ->assertJsonStructure(['data', 'meta']);
});

test('summary counts pending leave requests', function () {
    $leaveType = LeaveType::create([
        'tenant_id'   => $this->tenant->id,
        'name'        => 'Annual',
        'code'        => 'ANN',
        'default_days' => 20,
    ]);

    LeaveRequest::create([
        'tenant_id'     => $this->tenant->id,
        'employee_id'   => $this->employee->id,
        'leave_type_id' => $leaveType->id,
        'start_date'    => now()->addDays(5)->toDateString(),
        'end_date'      => now()->addDays(6)->toDateString(),
        'days'          => 2,
        'status'        => 'pending',
    ]);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/me/summary')
        ->assertStatus(200);

    expect($response->json('data.pending_leave_requests'))->toBe(1);
});

test('requires authentication', function () {
    $this->getJson('/api/v1/me')->assertStatus(401);
});
