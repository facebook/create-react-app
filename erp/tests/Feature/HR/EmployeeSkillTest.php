<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\EmployeeSkill;
use App\Modules\HR\Models\SkillDefinition;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'SkillCorp', 'slug' => 'skill-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeSkillEmployee(): Employee
{
    return Employee::create([
        'tenant_id'  => test()->tenant->id,
        'user_id'    => test()->admin->id,
        'first_name' => 'Skill',
        'last_name'  => 'Worker-' . uniqid(),
        'email'      => 'skill.' . uniqid() . '@test.com',
        'status'     => 'active',
        'start_date' => now()->toDateString(),
    ]);
}

function makeSkillDef(array $attrs = []): SkillDefinition
{
    return SkillDefinition::create([
        'tenant_id'   => test()->tenant->id,
        'name'        => 'PHP Programming',
        'category'    => 'technical',
        'is_active'   => true,
        ...$attrs,
    ]);
}

function makeEmpSkill(Employee $employee, array $attrs = []): EmployeeSkill
{
    return EmployeeSkill::create([
        'tenant_id'        => test()->tenant->id,
        'employee_id'      => $employee->id,
        'skill_name'       => 'Laravel',
        'proficiency_level' => 3,
        ...$attrs,
    ]);
}

it('index requires authentication', function () {
    $this->post('/logout');
    $this->get('/hr/employee-skills')->assertRedirect('/login');
});

it('admin can list employee skills', function () {
    $emp = makeSkillEmployee();
    makeEmpSkill($emp);

    $this->get('/hr/employee-skills')->assertOk();
});

it('staff with hr.view can list skills', function () {
    $this->actingAs($this->staff);
    $this->staff->givePermissionTo('hr.view');

    $emp = makeSkillEmployee();
    makeEmpSkill($emp);

    $this->get('/hr/employee-skills')->assertOk();
});

it('store creates an employee skill', function () {
    $emp = makeSkillEmployee();

    $this->post('/hr/employee-skills', [
        'employee_id'      => $emp->id,
        'skill_name'       => 'Docker',
        'proficiency_level' => 2,
    ])->assertRedirect();

    expect(EmployeeSkill::where('employee_id', $emp->id)->where('skill_name', 'Docker')->exists())->toBeTrue();
});

it('store validates required fields', function () {
    $this->postJson('/hr/employee-skills', [])->assertStatus(422)->assertJsonValidationErrors(['employee_id', 'skill_name', 'proficiency_level']);
});

it('proficiency_level must be between 1 and 5', function () {
    $emp = makeSkillEmployee();

    $this->postJson('/hr/employee-skills', [
        'employee_id'      => $emp->id,
        'skill_name'       => 'Test Skill',
        'proficiency_level' => 0,
    ])->assertStatus(422)->assertJsonValidationErrors(['proficiency_level']);

    $this->postJson('/hr/employee-skills', [
        'employee_id'      => $emp->id,
        'skill_name'       => 'Test Skill',
        'proficiency_level' => 6,
    ])->assertStatus(422)->assertJsonValidationErrors(['proficiency_level']);
});

it('show displays the skill', function () {
    $emp   = makeSkillEmployee();
    $skill = makeEmpSkill($emp);

    $this->get("/hr/employee-skills/{$skill->id}")->assertOk();
});

it('verify marks skill as verified with verifier info', function () {
    $emp   = makeSkillEmployee();
    $skill = makeEmpSkill($emp);

    expect($skill->is_verified)->toBeFalse();

    $this->post("/hr/employee-skills/{$skill->id}/verify")->assertRedirect();

    $skill->refresh();
    expect($skill->is_verified)->toBeTrue();
    expect($skill->verified_by)->toBe($this->admin->id);
    expect($skill->verified_at)->not->toBeNull();
});

it('proficiency_label accessor returns correct label for each level', function () {
    $emp = makeSkillEmployee();

    $labels = [
        1 => 'Beginner',
        2 => 'Basic',
        3 => 'Intermediate',
        4 => 'Advanced',
        5 => 'Expert',
    ];

    foreach ($labels as $level => $expected) {
        $skill = makeEmpSkill($emp, ['proficiency_level' => $level]);
        expect($skill->proficiency_label)->toBe($expected);
    }
});

it('destroy deletes the skill', function () {
    $emp   = makeSkillEmployee();
    $skill = makeEmpSkill($emp);

    $this->delete("/hr/employee-skills/{$skill->id}")->assertRedirect();

    expect(EmployeeSkill::find($skill->id))->toBeNull();
});
