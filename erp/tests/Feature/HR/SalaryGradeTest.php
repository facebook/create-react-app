<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\SalaryGrade;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'SalCorp', 'slug' => 'sal-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeSalaryGrade(array $attrs = []): SalaryGrade
{
    return SalaryGrade::create([
        'tenant_id'  => test()->tenant->id,
        'name'       => 'Grade-' . uniqid(),
        'min_salary' => 50000.00,
        'max_salary' => 80000.00,
        'currency'   => 'USD',
        'is_active'  => true,
        ...$attrs,
    ]);
}

it('index requires auth', function () {
    $this->post('/logout');
    $this->get('/hr/salary-grades')->assertRedirect('/login');
});

it('admin can list salary grades', function () {
    $this->get('/hr/salary-grades')->assertStatus(200);
});

it('staff with hr.view can list salary grades', function () {
    $this->actingAs($this->staff)
        ->get('/hr/salary-grades')
        ->assertStatus(200);
});

it('store creates a salary grade', function () {
    $this->post('/hr/salary-grades', [
        'name'        => 'Grade A',
        'code'        => 'GA',
        'min_salary'  => 40000,
        'max_salary'  => 70000,
        'currency'    => 'USD',
        'is_active'   => true,
    ])->assertRedirect();

    $grade = SalaryGrade::where('name', 'Grade A')->first();
    expect($grade)->not->toBeNull();
    expect($grade->tenant_id)->toBe($this->tenant->id);
    expect($grade->code)->toBe('GA');
    expect($grade->min_salary)->toBe(40000.0);
    expect($grade->max_salary)->toBe(70000.0);
});

it('store validates max_salary must be >= min_salary', function () {
    $this->postJson('/hr/salary-grades', [
        'name'       => 'Invalid Grade',
        'min_salary' => 80000,
        'max_salary' => 50000,
        'currency'   => 'USD',
    ])->assertStatus(422)
      ->assertJsonValidationErrors(['max_salary']);
});

it('store validates required fields', function () {
    $this->postJson('/hr/salary-grades', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'min_salary', 'max_salary']);
});

it('show displays a salary grade', function () {
    $grade = makeSalaryGrade();

    $this->get("/hr/salary-grades/{$grade->id}")->assertStatus(200);
});

it('update modifies a salary grade', function () {
    $grade = makeSalaryGrade();

    $this->put("/hr/salary-grades/{$grade->id}", [
        'name'        => 'Updated Grade',
        'min_salary'  => 55000,
        'max_salary'  => 90000,
        'currency'    => 'EUR',
        'is_active'   => false,
    ])->assertRedirect();

    $fresh = $grade->fresh();
    expect($fresh->name)->toBe('Updated Grade');
    expect($fresh->currency)->toBe('EUR');
    expect($fresh->is_active)->toBeFalse();
});

it('isSalaryInRange returns correct true/false', function () {
    $grade = makeSalaryGrade(['min_salary' => 50000, 'max_salary' => 80000]);

    expect($grade->isSalaryInRange(65000.0))->toBeTrue();
    expect($grade->isSalaryInRange(50000.0))->toBeTrue();
    expect($grade->isSalaryInRange(80000.0))->toBeTrue();
    expect($grade->isSalaryInRange(49999.0))->toBeFalse();
    expect($grade->isSalaryInRange(80001.0))->toBeFalse();
});

it('destroy soft-deletes the salary grade', function () {
    $grade = makeSalaryGrade();

    $this->delete("/hr/salary-grades/{$grade->id}")->assertRedirect('/hr/salary-grades');

    expect(SalaryGrade::find($grade->id))->toBeNull();
    expect(SalaryGrade::withTrashed()->find($grade->id))->not->toBeNull();
});
