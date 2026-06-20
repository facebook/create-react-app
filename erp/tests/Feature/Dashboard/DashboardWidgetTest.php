<?php

use App\Models\DashboardWidget;
use App\Models\User;
use App\Modules\Core\Models\Tenant;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Widget Co', 'slug' => 'widget-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('staff');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

test('user can list their widgets', function () {
    DashboardWidget::create([
        'tenant_id'   => $this->tenant->id,
        'user_id'     => $this->user->id,
        'widget_type' => 'kpi',
        'title'       => 'Open Invoices',
        'position'    => 0,
    ]);

    $response = $this->withToken($this->token)->getJson('/api/v1/dashboard-widgets');
    $response->assertStatus(200);
    expect($response->json('data'))->toHaveCount(1);
    expect($response->json('data.0.title'))->toBe('Open Invoices');
});

test('user can create a widget', function () {
    $response = $this->withToken($this->token)->postJson('/api/v1/dashboard-widgets', [
        'widget_type' => 'chart',
        'title'       => 'Monthly Revenue',
        'config'      => ['chart_type' => 'bar', 'period' => 'last_12_months'],
        'size'        => 'lg',
    ]);

    $response->assertStatus(201);
    expect(DashboardWidget::where('title', 'Monthly Revenue')->exists())->toBeTrue();
    $widget = DashboardWidget::where('title', 'Monthly Revenue')->first();
    expect($widget->config['chart_type'])->toBe('bar');
    expect($widget->size)->toBe('lg');
});

test('store validates widget_type', function () {
    $this->withToken($this->token)->postJson('/api/v1/dashboard-widgets', [
        'widget_type' => 'invalid',
        'title'       => 'Test',
    ])->assertStatus(422)->assertJsonValidationErrors(['widget_type']);
});

test('store validates size', function () {
    $this->withToken($this->token)->postJson('/api/v1/dashboard-widgets', [
        'widget_type' => 'kpi',
        'title'       => 'Test',
        'size'        => 'xxl',
    ])->assertStatus(422)->assertJsonValidationErrors(['size']);
});

test('user can update a widget', function () {
    $widget = DashboardWidget::create([
        'tenant_id'   => $this->tenant->id,
        'user_id'     => $this->user->id,
        'widget_type' => 'kpi',
        'title'       => 'Old Title',
        'position'    => 0,
    ]);

    $response = $this->withToken($this->token)->putJson("/api/v1/dashboard-widgets/{$widget->id}", [
        'title'      => 'New Title',
        'is_visible' => false,
    ]);

    $response->assertStatus(200);
    $widget->refresh();
    expect($widget->title)->toBe('New Title');
    expect($widget->is_visible)->toBeFalse();
});

test('user can reorder widgets', function () {
    $w1 = DashboardWidget::create([
        'tenant_id' => $this->tenant->id, 'user_id' => $this->user->id,
        'widget_type' => 'kpi', 'title' => 'W1', 'position' => 0,
    ]);
    $w2 = DashboardWidget::create([
        'tenant_id' => $this->tenant->id, 'user_id' => $this->user->id,
        'widget_type' => 'kpi', 'title' => 'W2', 'position' => 1,
    ]);

    $this->withToken($this->token)->postJson('/api/v1/dashboard-widgets/reorder', [
        'order' => [$w2->id, $w1->id],
    ])->assertStatus(200);

    expect($w2->fresh()->position)->toBe(0);
    expect($w1->fresh()->position)->toBe(1);
});

test('user can delete a widget', function () {
    $widget = DashboardWidget::create([
        'tenant_id'   => $this->tenant->id,
        'user_id'     => $this->user->id,
        'widget_type' => 'table',
        'title'       => 'Delete Me',
        'position'    => 0,
    ]);

    $this->withToken($this->token)->deleteJson("/api/v1/dashboard-widgets/{$widget->id}")
        ->assertStatus(200);

    expect(DashboardWidget::find($widget->id))->toBeNull();
});

test('widgets are user-scoped within tenant', function () {
    $otherUser = User::factory()->create(['tenant_id' => $this->tenant->id]);
    DashboardWidget::create([
        'tenant_id'   => $this->tenant->id,
        'user_id'     => $otherUser->id,
        'widget_type' => 'kpi',
        'title'       => 'Other User Widget',
        'position'    => 0,
    ]);

    $response = $this->withToken($this->token)->getJson('/api/v1/dashboard-widgets');
    $response->assertStatus(200);
    expect($response->json('data'))->toBeEmpty();
});

test('requires authentication', function () {
    $this->getJson('/api/v1/dashboard-widgets')->assertStatus(401);
});
