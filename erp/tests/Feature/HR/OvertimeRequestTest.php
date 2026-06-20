<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\OvertimeRequest;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'OTCorp', 'slug' => 'ot-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeOTEmployee(): Employee
{
    return Employee::create([
        'tenant_id'  => test()->tenant->id,
        'user_id'    => test()->admin->id,
        'first_name' => 'OT',
        'last_name'  => 'Worker-' . uniqid(),
        'email'      => 'ot.' . uniqid() . '@test.com',
        'status'     => 'active',
        'start_date' => now()->toDateString(),
    ]);
}

function makeOvertimeRequest(Employee $employee, array $attrs = []): OvertimeRequest
{
    return OvertimeRequest::create([
        'tenant_id'   => test()->tenant->id,
        'employee_id' => $employee->id,
        'work_date'   => now()->toDateString(),
        'hours'       => 2.0,
        ...$attrs,
    ]);
}

it('index requires authentication', function () {
    $this->post('/logout');
    $this->get('/hr/overtime-requests')->assertRedirect('/login');
});

it('admin can list overtime requests', function () {
    $emp = makeOTEmployee();
    makeOvertimeRequest($emp);

    $this->get('/hr/overtime-requests')->assertOk();
});

it('store creates an overtime request', function () {
    $emp = makeOTEmployee();

    $this->post('/hr/overtime-requests', [
        'employee_id' => $emp->id,
        'work_date'   => now()->toDateString(),
        'hours'       => 3.0,
        'reason'      => 'Month-end closing',
    ])->assertRedirect();

    expect(OvertimeRequest::where('employee_id', $emp->id)->where('hours', 3.0)->exists())->toBeTrue();
});

it('store validates required fields', function () {
    $this->postJson('/hr/overtime-requests', [])->assertStatus(422)->assertJsonValidationErrors(['employee_id', 'work_date', 'hours']);
});

it('store requires valid employee', function () {
    $this->postJson('/hr/overtime-requests', [
        'employee_id' => 99999,
        'work_date'   => now()->toDateString(),
        'hours'       => 2.0,
    ])->assertStatus(422)->assertJsonValidationErrors(['employee_id']);
});

it('show displays overtime request', function () {
    $emp = makeOTEmployee();
    $req = makeOvertimeRequest($emp);

    $this->get("/hr/overtime-requests/{$req->id}")->assertOk();
});

it('approve marks request as approved', function () {
    $emp = makeOTEmployee();
    $req = makeOvertimeRequest($emp);

    expect($req->is_pending)->toBeTrue();

    $this->post("/hr/overtime-requests/{$req->id}/approve")->assertRedirect();

    $req->refresh();
    expect($req->is_approved)->toBeTrue();
    expect($req->approved_by)->toBe($this->admin->id);
    expect($req->approved_at)->not->toBeNull();
});

it('reject marks request as rejected with reason', function () {
    $emp = makeOTEmployee();
    $req = makeOvertimeRequest($emp);

    $this->post("/hr/overtime-requests/{$req->id}/reject", ['reason' => 'Not justified'])->assertRedirect();

    $req->refresh();
    expect($req->status)->toBe('rejected');
    expect($req->rejection_reason)->toBe('Not justified');
});

it('cancel marks request as cancelled', function () {
    $emp = makeOTEmployee();
    $req = makeOvertimeRequest($emp);

    $this->post("/hr/overtime-requests/{$req->id}/cancel")->assertRedirect();

    $req->refresh();
    expect($req->status)->toBe('cancelled');
});

it('total_pay accessor multiplies hours by rate', function () {
    $emp = makeOTEmployee();
    $req = makeOvertimeRequest($emp, ['hours' => 4.0, 'rate_multiplier' => 1.5]);

    expect($req->total_pay)->toBe(6.0);
});

it('destroy soft-deletes the request', function () {
    $emp = makeOTEmployee();
    $req = makeOvertimeRequest($emp);

    $this->delete("/hr/overtime-requests/{$req->id}")->assertRedirect();

    expect(OvertimeRequest::find($req->id))->toBeNull();
    expect(OvertimeRequest::withTrashed()->find($req->id))->not->toBeNull();
});
