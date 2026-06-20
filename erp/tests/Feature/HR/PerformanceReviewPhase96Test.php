<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\PerformanceReview;
use App\Modules\HR\Models\ReviewRating;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Review Corp', 'slug' => 'review-corp']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeRevEmployee(): Employee
{
    return Employee::create([
        'tenant_id'  => test()->tenant->id,
        'user_id'    => test()->admin->id,
        'first_name' => 'Rev',
        'last_name'  => 'Iewer',
        'email'      => 'rev.iewer.' . uniqid() . '@test.com',
        'status'     => 'active',
        'start_date' => now()->toDateString(),
    ]);
}

function makeReview(string $status = 'draft'): PerformanceReview
{
    $emp = makeRevEmployee();
    return PerformanceReview::create([
        'tenant_id'   => test()->tenant->id,
        'employee_id' => $emp->id,
        'reviewer_id' => test()->admin->id,
        'period'      => 'Q2 2026',
        'review_date' => now()->toDateString(),
        'status'      => $status,
    ]);
}

it('admin can list performance reviews', function () {
    $this->get('/hr/performance-reviews')->assertStatus(200);
});

it('admin can create a performance review', function () {
    $emp = makeRevEmployee();
    $this->post('/hr/performance-reviews', [
        'employee_id'    => $emp->id,
        'period'         => 'Q2 2026',
        'review_date'    => now()->toDateString(),
        'overall_rating' => 4,
        'strengths'      => 'Excellent work',
    ])->assertRedirect();
    expect(PerformanceReview::where('employee_id', $emp->id)->exists())->toBeTrue();
});

it('performance review store requires employee_id and period', function () {
    $this->postJson('/hr/performance-reviews', [])->assertStatus(422)
        ->assertJsonValidationErrors(['employee_id', 'period', 'review_date']);
});

it('admin can view a performance review', function () {
    $review = makeReview();
    $this->get("/hr/performance-reviews/{$review->id}")->assertStatus(200);
});

it('admin can submit a review', function () {
    $review = makeReview('draft');
    $this->post("/hr/performance-reviews/{$review->id}/submit")->assertRedirect();
    expect($review->fresh()->status)->toBe('submitted');
    expect($review->fresh()->submitted_at)->not->toBeNull();
});

it('admin can acknowledge a review', function () {
    $review = makeReview('submitted');
    $this->post("/hr/performance-reviews/{$review->id}/acknowledge", ['comments' => 'Noted'])->assertRedirect();
    expect($review->fresh()->status)->toBe('acknowledged');
    expect($review->fresh()->employee_comments)->toBe('Noted');
});

it('is_complete returns true for acknowledged reviews', function () {
    $review = makeReview('acknowledged');
    expect($review->is_complete)->toBeTrue();
    $review2 = makeReview('draft');
    expect($review2->is_complete)->toBeFalse();
});

it('average_rating uses ratings if present', function () {
    $review = makeReview();
    ReviewRating::create(['tenant_id' => test()->tenant->id, 'performance_review_id' => $review->id, 'competency' => 'Comm', 'rating' => 4]);
    ReviewRating::create(['tenant_id' => test()->tenant->id, 'performance_review_id' => $review->id, 'competency' => 'Tech', 'rating' => 5]);
    expect($review->average_rating)->toBe(4.5);
});

it('store creates rating rows when provided', function () {
    $emp = makeRevEmployee();
    $this->post('/hr/performance-reviews', [
        'employee_id' => $emp->id,
        'period'      => 'Q3 2026',
        'review_date' => now()->toDateString(),
        'ratings'     => [
            ['competency' => 'Leadership', 'rating' => 3, 'notes' => ''],
            ['competency' => 'Delivery',   'rating' => 4, 'notes' => ''],
        ],
    ])->assertRedirect();
    $review = PerformanceReview::where('employee_id', $emp->id)->first();
    expect($review->ratings()->count())->toBe(2);
});

it('staff cannot delete a performance review', function () {
    $review = makeReview();
    $this->actingAs($this->staff)
        ->delete("/hr/performance-reviews/{$review->id}")
        ->assertStatus(403);
});
