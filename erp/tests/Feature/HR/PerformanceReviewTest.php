<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\PerformanceKpi;
use App\Modules\HR\Models\PerformanceReview;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Review Co', 'slug' => 'review-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makePrEmployee(): Employee
{
    return Employee::create([
        'tenant_id'     => test()->tenant->id,
        'first_name'    => 'Alice',
        'last_name'     => 'Jones',
        'email'         => 'alice@test.com',
        'start_date'    => now()->toDateString(),
        'salary_amount' => 70000,
        'status'        => 'active',
    ]);
}

function makePrReview(Employee $employee, string $status = 'draft'): PerformanceReview
{
    return PerformanceReview::create([
        'tenant_id'     => test()->tenant->id,
        'employee_id'   => $employee->id,
        'review_period' => 'Q1 2026',
        'review_date'   => now()->toDateString(),
        'status'        => $status,
    ]);
}

it('admin can list performance reviews', function () {
    $response = $this->get('/hr/performance-reviews');
    $response->assertStatus(200);
});

it('admin can create a review', function () {
    $employee = makePrEmployee();

    $response = $this->post('/hr/performance-reviews', [
        'employee_id'   => $employee->id,
        'review_period' => 'Q1 2026',
        'review_date'   => now()->toDateString(),
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('performance_reviews', [
        'employee_id'   => $employee->id,
        'review_period' => 'Q1 2026',
    ]);
});

it('store requires employee_id, review_period, review_date', function () {
    $this->postJson('/hr/performance-reviews', [])
        ->assertStatus(422);
});

it('admin can view a review', function () {
    $employee = makePrEmployee();
    $review = makePrReview($employee);

    $response = $this->get("/hr/performance-reviews/{$review->id}");
    $response->assertStatus(200);
});

it('admin can submit a review', function () {
    $employee = makePrEmployee();
    $review = makePrReview($employee);

    $this->post("/hr/performance-reviews/{$review->id}/submit");

    expect($review->fresh()->status)->toBe('submitted');
});

it('admin can acknowledge a review', function () {
    $employee = makePrEmployee();
    $review = makePrReview($employee, 'submitted');

    $this->post("/hr/performance-reviews/{$review->id}/acknowledge");

    expect($review->fresh()->status)->toBe('acknowledged');
});

it('admin can add a kpi', function () {
    $employee = makePrEmployee();
    $review = makePrReview($employee);

    $response = $this->post("/hr/performance-reviews/{$review->id}/kpis", [
        'name'         => 'Sales Target',
        'target_score' => 100,
        'actual_score' => 80,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('performance_kpis', [
        'performance_review_id' => $review->id,
        'name'                  => 'Sales Target',
    ]);
});

it('achievement_percent accessor is correct', function () {
    $employee = makePrEmployee();
    $review = makePrReview($employee);

    $kpi = PerformanceKpi::create([
        'tenant_id'             => test()->tenant->id,
        'performance_review_id' => $review->id,
        'name'                  => 'Quality',
        'target_score'          => 100,
        'actual_score'          => 75,
        'weight'                => 1,
    ]);

    expect($kpi->achievement_percent)->toBe(75.0);
});

it('average_kpi_score accessor is correct', function () {
    $employee = makePrEmployee();
    $review = makePrReview($employee);

    PerformanceKpi::create([
        'tenant_id'             => test()->tenant->id,
        'performance_review_id' => $review->id,
        'name'                  => 'KPI 1',
        'target_score'          => 100,
        'actual_score'          => 80,
        'weight'                => 1,
    ]);

    PerformanceKpi::create([
        'tenant_id'             => test()->tenant->id,
        'performance_review_id' => $review->id,
        'name'                  => 'KPI 2',
        'target_score'          => 100,
        'actual_score'          => 60,
        'weight'                => 1,
    ]);

    $review->load('kpis');
    expect($review->average_kpi_score)->toBe(70.0);
});

it('staff cannot delete a review', function () {
    $employee = makePrEmployee();
    $review = makePrReview($employee);

    $this->actingAs($this->staff);
    $response = $this->delete("/hr/performance-reviews/{$review->id}");
    $response->assertStatus(403);
});
