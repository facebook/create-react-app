<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\EmployeeSurvey;
use App\Modules\HR\Models\SurveyResponse;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'SurveyCorp', 'slug' => 'survey-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeSurveyEmployee(): Employee
{
    return Employee::create([
        'tenant_id'  => test()->tenant->id,
        'user_id'    => test()->admin->id,
        'first_name' => 'Survey',
        'last_name'  => 'Worker-' . uniqid(),
        'email'      => 'survey.' . uniqid() . '@test.com',
        'status'     => 'active',
        'start_date' => now()->toDateString(),
    ]);
}

function makeEmpSurvey(array $attrs = []): EmployeeSurvey
{
    return EmployeeSurvey::create([
        'tenant_id'  => test()->tenant->id,
        'title'      => 'Q' . uniqid() . ' Pulse Check',
        'created_by' => test()->admin->id,
        ...$attrs,
    ]);
}

it('index requires authentication', function () {
    $this->post('/logout');
    $this->get('/hr/surveys')->assertRedirect('/login');
});

it('admin can list surveys', function () {
    makeEmpSurvey();
    $this->get('/hr/surveys')->assertOk();
});

it('store creates a survey', function () {
    $this->post('/hr/surveys', [
        'title'       => 'Annual Engagement Survey',
        'description' => 'Tell us how you feel.',
        'start_date'  => now()->toDateString(),
        'end_date'    => now()->addDays(14)->toDateString(),
    ])->assertRedirect();

    expect(EmployeeSurvey::where('title', 'Annual Engagement Survey')->exists())->toBeTrue();
});

it('store validates required fields', function () {
    $this->postJson('/hr/surveys', [])->assertStatus(422)->assertJsonValidationErrors(['title']);
});

it('show displays a survey', function () {
    $survey = makeEmpSurvey();
    $this->get("/hr/surveys/{$survey->id}")->assertOk();
});

it('publish transitions status to published', function () {
    $survey = makeEmpSurvey();
    expect($survey->status)->toBe('draft');

    $this->post("/hr/surveys/{$survey->id}/publish")->assertRedirect();

    $survey->refresh();
    expect($survey->status)->toBe('published');
});

it('close transitions status to closed', function () {
    $survey = makeEmpSurvey(['status' => 'published']);
    $this->post("/hr/surveys/{$survey->id}/close")->assertRedirect();
    $survey->refresh();
    expect($survey->status)->toBe('closed');
});

it('respond stores a survey response', function () {
    $survey = makeEmpSurvey(['status' => 'published']);
    $emp    = makeSurveyEmployee();

    $this->post("/hr/surveys/{$survey->id}/respond", [
        'employee_id' => $emp->id,
        'answers'     => [['question_id' => 1, 'answer' => 'Great!']],
    ])->assertRedirect();

    expect(SurveyResponse::where('employee_survey_id', $survey->id)->exists())->toBeTrue();
});

it('respond validates answers required', function () {
    $survey = makeEmpSurvey(['status' => 'published']);
    $this->postJson("/hr/surveys/{$survey->id}/respond", [])->assertStatus(422)->assertJsonValidationErrors(['answers']);
});

it('is_active accessor returns true for published survey without end date', function () {
    $survey = makeEmpSurvey(['status' => 'published']);
    expect($survey->is_active)->toBeTrue();
});

it('is_active accessor returns false for closed survey', function () {
    $survey = makeEmpSurvey(['status' => 'closed']);
    expect($survey->is_active)->toBeFalse();
});

it('destroy soft-deletes the survey', function () {
    $survey = makeEmpSurvey();
    $this->delete("/hr/surveys/{$survey->id}")->assertRedirect();
    expect(EmployeeSurvey::find($survey->id))->toBeNull();
    expect(EmployeeSurvey::withTrashed()->find($survey->id))->not->toBeNull();
});
