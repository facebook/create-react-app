<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Inventory\Models\SupplierScorecard;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'ScorecardCorp', 'slug' => 'scorecard-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeSupplierScorecard(array $attrs = []): SupplierScorecard
{
    return SupplierScorecard::create([
        'tenant_id'     => test()->tenant->id,
        'supplier_name' => 'Supplier ' . uniqid(),
        'period'        => '2026-Q1',
        ...$attrs,
    ]);
}

it('index requires authentication', function () {
    $this->post('/logout');
    $this->get('/inventory/supplier-scorecards')->assertRedirect('/login');
});

it('admin can list supplier scorecards', function () {
    makeSupplierScorecard();
    $this->get('/inventory/supplier-scorecards')->assertOk();
});

it('store creates a supplier scorecard', function () {
    $this->post('/inventory/supplier-scorecards', [
        'supplier_name' => 'Acme Corp',
        'period'        => '2026-Q2',
    ])->assertRedirect();

    expect(SupplierScorecard::where('supplier_name', 'Acme Corp')->exists())->toBeTrue();
});

it('store validates required fields', function () {
    $this->postJson('/inventory/supplier-scorecards', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['supplier_name', 'period']);
});

it('show displays a supplier scorecard', function () {
    $scorecard = makeSupplierScorecard();
    $this->get("/inventory/supplier-scorecards/{$scorecard->id}")->assertOk();
});

it('publish calculates overall score and transitions status', function () {
    $scorecard = makeSupplierScorecard([
        'quality_score'  => 90,
        'delivery_score' => 80,
        'pricing_score'  => 70,
        'service_score'  => 85,
    ]);
    expect($scorecard->status)->toBe('draft');

    $this->post("/inventory/supplier-scorecards/{$scorecard->id}/publish")->assertRedirect();

    $scorecard->refresh();
    expect($scorecard->status)->toBe('published');
    expect($scorecard->is_published)->toBeTrue();
    expect((float)$scorecard->overall_score)->toBe(81.25);
    expect($scorecard->rating)->toBe('excellent');
    expect($scorecard->scorecard_number)->not->toBeNull();
    expect($scorecard->published_at)->not->toBeNull();
});

it('calculateOverallScore sets correct rating bands', function () {
    $poor = makeSupplierScorecard(['quality_score' => 20, 'delivery_score' => 30, 'pricing_score' => 35, 'service_score' => 25]);
    $poor->calculateOverallScore();
    expect($poor->rating)->toBe('poor');

    $fair = makeSupplierScorecard(['quality_score' => 50, 'delivery_score' => 55, 'pricing_score' => 50, 'service_score' => 55]);
    $fair->calculateOverallScore();
    expect($fair->rating)->toBe('fair');

    $good = makeSupplierScorecard(['quality_score' => 70, 'delivery_score' => 75, 'pricing_score' => 65, 'service_score' => 70]);
    $good->calculateOverallScore();
    expect($good->rating)->toBe('good');
});

it('destroy soft-deletes the scorecard', function () {
    $scorecard = makeSupplierScorecard();
    $this->delete("/inventory/supplier-scorecards/{$scorecard->id}")->assertRedirect();
    expect(SupplierScorecard::find($scorecard->id))->toBeNull();
    expect(SupplierScorecard::withTrashed()->find($scorecard->id))->not->toBeNull();
});
