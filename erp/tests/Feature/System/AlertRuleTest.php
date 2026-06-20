<?php

use App\Models\AlertEvent;
use App\Models\AlertRule;
use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Inventory\Models\Product;
use App\Services\AlertEvaluatorService;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Alert Co', 'slug' => 'alert-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

test('can list alert rules', function () {
    AlertRule::create([
        'tenant_id'            => $this->tenant->id,
        'name'                 => 'Overdue Watch',
        'type'                 => 'overdue_invoice',
        'conditions'           => ['days' => 30],
        'notification_targets' => [$this->user->id],
    ]);

    $this->withToken($this->token)->getJson('/api/v1/alert-rules')
        ->assertStatus(200)
        ->assertJsonPath('data.0.name', 'Overdue Watch');
});

test('can create an alert rule', function () {
    $response = $this->withToken($this->token)->postJson('/api/v1/alert-rules', [
        'name'                 => 'Low Stock Alert',
        'type'                 => 'low_stock',
        'conditions'           => ['below' => 5],
        'notification_targets' => [$this->user->id],
    ]);

    $response->assertStatus(201);
    expect(AlertRule::where('name', 'Low Stock Alert')->exists())->toBeTrue();
});

test('store validates type', function () {
    $this->withToken($this->token)->postJson('/api/v1/alert-rules', [
        'name'                 => 'Bad Alert',
        'type'                 => 'unknown_type',
        'conditions'           => [],
        'notification_targets' => [1],
    ])->assertStatus(422)->assertJsonValidationErrors(['type']);
});

test('can update an alert rule', function () {
    $rule = AlertRule::create([
        'tenant_id'            => $this->tenant->id,
        'name'                 => 'Original',
        'type'                 => 'overdue_invoice',
        'conditions'           => ['days' => 30],
        'notification_targets' => [$this->user->id],
    ]);

    $this->withToken($this->token)->putJson("/api/v1/alert-rules/{$rule->id}", [
        'is_active' => false,
    ])->assertStatus(200);

    expect($rule->fresh()->is_active)->toBeFalse();
});

test('can delete an alert rule', function () {
    $rule = AlertRule::create([
        'tenant_id'            => $this->tenant->id,
        'name'                 => 'Delete Me',
        'type'                 => 'low_stock',
        'conditions'           => ['below' => 10],
        'notification_targets' => [1],
    ]);

    $this->withToken($this->token)->deleteJson("/api/v1/alert-rules/{$rule->id}")
        ->assertStatus(200);

    expect(AlertRule::find($rule->id))->toBeNull();
});

test('evaluator detects low stock', function () {
    Product::create([
        'tenant_id'     => $this->tenant->id,
        'name'          => 'Critical Part',
        'sku'           => 'SKU-ALERT-1',
        'stock_quantity' => 2,
        'reorder_point'  => 10,
        'cost_price'     => 50,
        'sale_price'     => 100,
    ]);

    $rule = AlertRule::create([
        'tenant_id'            => $this->tenant->id,
        'name'                 => 'Low Stock',
        'type'                 => 'low_stock',
        'conditions'           => ['below' => 5],
        'notification_targets' => [$this->user->id],
    ]);

    $evaluator = app(AlertEvaluatorService::class);
    $triggered = $evaluator->evaluate($rule);

    expect($triggered)->not->toBeEmpty();
    expect($triggered[0]['message'])->toContain('stock');
});

test('evaluator does not trigger when no issues', function () {
    $rule = AlertRule::create([
        'tenant_id'            => $this->tenant->id,
        'name'                 => 'Overdue Check',
        'type'                 => 'overdue_invoice',
        'conditions'           => ['days' => 30],
        'notification_targets' => [$this->user->id],
    ]);

    $evaluator = app(AlertEvaluatorService::class);
    $triggered = $evaluator->evaluate($rule);

    expect($triggered)->toBeEmpty();
});

test('fire creates alert events', function () {
    $rule = AlertRule::create([
        'tenant_id'            => $this->tenant->id,
        'name'                 => 'Fire Test',
        'type'                 => 'low_stock',
        'conditions'           => ['below' => 10],
        'notification_targets' => [],
    ]);

    $evaluator = app(AlertEvaluatorService::class);
    $evaluator->fire($rule, [['message' => 'Test alert fired', 'context' => ['count' => 1]]]);

    expect(AlertEvent::where('alert_rule_id', $rule->id)->exists())->toBeTrue();
    expect($rule->fresh()->last_triggered_at)->not->toBeNull();
});

test('run endpoint evaluates rule immediately', function () {
    $rule = AlertRule::create([
        'tenant_id'            => $this->tenant->id,
        'name'                 => 'Manual Run',
        'type'                 => 'overdue_invoice',
        'conditions'           => ['days' => 30],
        'notification_targets' => [$this->user->id],
    ]);

    $response = $this->withToken($this->token)->postJson("/api/v1/alert-rules/{$rule->id}/run");
    $response->assertStatus(200)->assertJsonStructure(['data' => ['triggered', 'events']]);
});

test('requires authentication', function () {
    $this->getJson('/api/v1/alert-rules')->assertStatus(401);
});
