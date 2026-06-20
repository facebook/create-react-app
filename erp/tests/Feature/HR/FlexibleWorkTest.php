<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\FlexibleWorkArrangement;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'FWAcorp', 'slug' => 'fwa-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeFWAEmployee(): Employee
{
    return Employee::create([
        'tenant_id'  => test()->tenant->id,
        'user_id'    => test()->admin->id,
        'first_name' => 'Flex',
        'last_name'  => 'Worker-' . uniqid(),
        'email'      => 'fwa.' . uniqid() . '@test.com',
        'status'     => 'active',
        'start_date' => now()->toDateString(),
    ]);
}

function makeFlexWork(array $attrs = []): FlexibleWorkArrangement
{
    $emp = makeFWAEmployee();
    return FlexibleWorkArrangement::create([
        'tenant_id'        => test()->tenant->id,
        'employee_id'      => $emp->id,
        'arrangement_type' => 'remote',
        'start_date'       => now()->toDateString(),
        ...$attrs,
    ]);
}

it('index requires authentication', function () {
    $this->post('/logout');
    $this->get('/hr/flexible-work')->assertRedirect('/login');
});

it('admin can list flexible work arrangements', function () {
    makeFlexWork();
    $this->get('/hr/flexible-work')->assertOk();
});

it('store creates a flexible work arrangement', function () {
    $emp = makeFWAEmployee();
    $this->post('/hr/flexible-work', [
        'employee_id'      => $emp->id,
        'arrangement_type' => 'hybrid',
        'start_date'       => now()->toDateString(),
        'end_date'         => now()->addMonths(6)->toDateString(),
    ])->assertRedirect();

    expect(FlexibleWorkArrangement::where('employee_id', $emp->id)->where('arrangement_type', 'hybrid')->exists())->toBeTrue();
});

it('store validates required fields', function () {
    $this->postJson('/hr/flexible-work', [])->assertStatus(422)->assertJsonValidationErrors(['employee_id', 'arrangement_type', 'start_date']);
});

it('show displays the arrangement', function () {
    $fwa = makeFlexWork();
    $this->get("/hr/flexible-work/{$fwa->id}")->assertOk();
});

it('approve transitions to approved', function () {
    $fwa = makeFlexWork();
    expect($fwa->is_pending)->toBeTrue();

    $this->post("/hr/flexible-work/{$fwa->id}/approve")->assertRedirect();

    $fwa->refresh();
    expect($fwa->status)->toBe('approved');
    expect($fwa->approved_by)->toBe(test()->admin->id);
});

it('reject transitions to rejected with reason', function () {
    $fwa = makeFlexWork();
    $this->post("/hr/flexible-work/{$fwa->id}/reject", ['reason' => 'Business needs'])->assertRedirect();
    $fwa->refresh();
    expect($fwa->status)->toBe('rejected');
    expect($fwa->rejection_reason)->toBe('Business needs');
});

it('is_active returns true for approved arrangement without end date', function () {
    $fwa = makeFlexWork(['status' => 'approved']);
    expect($fwa->is_active)->toBeTrue();
});

it('is_active returns false for rejected arrangement', function () {
    $fwa = makeFlexWork(['status' => 'rejected']);
    expect($fwa->is_active)->toBeFalse();
});

it('destroy soft-deletes the arrangement', function () {
    $fwa = makeFlexWork();
    $this->delete("/hr/flexible-work/{$fwa->id}")->assertRedirect();
    expect(FlexibleWorkArrangement::find($fwa->id))->toBeNull();
    expect(FlexibleWorkArrangement::withTrashed()->find($fwa->id))->not->toBeNull();
});
