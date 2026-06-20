<?php

use App\Jobs\SendScheduledReportJob;
use App\Mail\ScheduledReportMail;
use App\Models\ReportSchedule;
use App\Models\User;
use App\Modules\Core\Models\Tenant;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Schedule Co', 'slug' => 'schedule-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

test('can list report schedules', function () {
    ReportSchedule::create([
        'tenant_id'   => $this->tenant->id,
        'user_id'     => $this->user->id,
        'name'        => 'Weekly Finance',
        'report_type' => 'financial',
        'frequency'   => 'weekly',
        'recipients'  => ['admin@example.com'],
        'is_active'   => true,
    ]);

    $response = $this->withToken($this->token)->getJson('/api/v1/report-schedules');

    $response->assertStatus(200);
    expect($response->json('data'))->toHaveCount(1);
    expect($response->json('data.0.name'))->toBe('Weekly Finance');
});

test('can create a report schedule', function () {
    $response = $this->withToken($this->token)->postJson('/api/v1/report-schedules', [
        'name'        => 'Daily HR',
        'report_type' => 'hr',
        'frequency'   => 'daily',
        'recipients'  => ['hr@example.com', 'ceo@example.com'],
    ]);

    $response->assertStatus(201);
    expect(ReportSchedule::where('name', 'Daily HR')->exists())->toBeTrue();
    $schedule = ReportSchedule::where('name', 'Daily HR')->first();
    expect($schedule->recipients)->toContain('hr@example.com');
    expect($schedule->next_run_at)->not->toBeNull();
});

test('store validates required fields', function () {
    $this->withToken($this->token)->postJson('/api/v1/report-schedules', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'report_type', 'frequency', 'recipients']);
});

test('store validates report_type enum', function () {
    $this->withToken($this->token)->postJson('/api/v1/report-schedules', [
        'name'        => 'Bad Report',
        'report_type' => 'invalid',
        'frequency'   => 'daily',
        'recipients'  => ['test@test.com'],
    ])->assertStatus(422)->assertJsonValidationErrors(['report_type']);
});

test('can update a report schedule', function () {
    $schedule = ReportSchedule::create([
        'tenant_id'   => $this->tenant->id,
        'user_id'     => $this->user->id,
        'name'        => 'Old Name',
        'report_type' => 'inventory',
        'frequency'   => 'monthly',
        'recipients'  => ['old@example.com'],
        'is_active'   => true,
    ]);

    $response = $this->withToken($this->token)->putJson("/api/v1/report-schedules/{$schedule->id}", [
        'name'       => 'New Name',
        'is_active'  => false,
        'recipients' => ['new@example.com'],
        'frequency'  => 'weekly',
        'report_type' => 'inventory',
    ]);

    $response->assertStatus(200);
    $schedule->refresh();
    expect($schedule->name)->toBe('New Name');
    expect($schedule->is_active)->toBeFalse();
});

test('can delete a report schedule', function () {
    $schedule = ReportSchedule::create([
        'tenant_id'   => $this->tenant->id,
        'user_id'     => $this->user->id,
        'name'        => 'Delete Me',
        'report_type' => 'financial',
        'frequency'   => 'daily',
        'recipients'  => ['test@test.com'],
        'is_active'   => true,
    ]);

    $this->withToken($this->token)->deleteJson("/api/v1/report-schedules/{$schedule->id}")
        ->assertStatus(200);

    expect(ReportSchedule::find($schedule->id))->toBeNull();
});

test('send-now dispatches job', function () {
    Queue::fake();

    $schedule = ReportSchedule::create([
        'tenant_id'   => $this->tenant->id,
        'user_id'     => $this->user->id,
        'name'        => 'Immediate Report',
        'report_type' => 'financial',
        'frequency'   => 'weekly',
        'recipients'  => ['boss@example.com'],
        'is_active'   => true,
    ]);

    $this->withToken($this->token)->postJson("/api/v1/report-schedules/{$schedule->id}/send")
        ->assertStatus(200);

    Queue::assertPushed(SendScheduledReportJob::class, fn ($job) => $job->schedule->id === $schedule->id);
});

test('job sends mail and updates last_sent_at', function () {
    Mail::fake();

    $schedule = ReportSchedule::create([
        'tenant_id'   => $this->tenant->id,
        'user_id'     => $this->user->id,
        'name'        => 'Test Delivery',
        'report_type' => 'inventory',
        'frequency'   => 'weekly',
        'recipients'  => ['team@example.com'],
        'is_active'   => true,
    ]);

    $job = new SendScheduledReportJob($schedule);
    $job->handle();

    Mail::assertSent(ScheduledReportMail::class, fn ($mail) => $mail->hasTo('team@example.com'));
    $schedule->refresh();
    expect($schedule->last_sent_at)->not->toBeNull();
    expect($schedule->next_run_at)->not->toBeNull();
});

test('requires authentication', function () {
    $this->getJson('/api/v1/report-schedules')->assertStatus(401);
});

test('does not show schedules from other tenants', function () {
    $otherTenant = Tenant::create(['name' => 'Other Tenant', 'slug' => 'other-tenant-' . uniqid()]);
    $otherUser   = User::factory()->create(['tenant_id' => $otherTenant->id]);

    ReportSchedule::create([
        'tenant_id'   => $otherTenant->id,
        'user_id'     => $otherUser->id,
        'name'        => 'Other Tenant Schedule',
        'report_type' => 'hr',
        'frequency'   => 'monthly',
        'recipients'  => ['other@example.com'],
    ]);

    $response = $this->withToken($this->token)->getJson('/api/v1/report-schedules');
    $response->assertStatus(200);
    collect($response->json('data'))->each(function ($s) {
        expect($s['tenant_id'])->toBe($this->tenant->id);
    });
});
