<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\Competency;
use App\Modules\HR\Models\CompetencyFramework;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'CompCorp', 'slug' => 'comp-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeCFFramework(array $attrs = []): CompetencyFramework
{
    return CompetencyFramework::create([
        'tenant_id'  => test()->tenant->id,
        'name'       => 'Framework ' . uniqid(),
        'created_by' => test()->admin->id,
        ...$attrs,
    ]);
}

it('index requires authentication', function () {
    $this->post('/logout');
    $this->get('/hr/competency-frameworks')->assertRedirect('/login');
});

it('admin can list competency frameworks', function () {
    makeCFFramework();
    $this->get('/hr/competency-frameworks')->assertOk();
});

it('store creates a competency framework', function () {
    $this->post('/hr/competency-frameworks', [
        'name' => 'Leadership Framework',
    ])->assertRedirect();

    expect(CompetencyFramework::where('name', 'Leadership Framework')->exists())->toBeTrue();
});

it('store validates required fields', function () {
    $this->postJson('/hr/competency-frameworks', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['name']);
});

it('show displays a competency framework', function () {
    $framework = makeCFFramework();
    $this->get("/hr/competency-frameworks/{$framework->id}")->assertOk();
});

it('activate transitions status to active', function () {
    $framework = makeCFFramework();
    expect($framework->status)->toBe('draft');

    $this->post("/hr/competency-frameworks/{$framework->id}/activate")->assertRedirect();

    $framework->refresh();
    expect($framework->status)->toBe('active');
    expect($framework->is_active)->toBeTrue();
});

it('archive transitions status to archived', function () {
    $framework = makeCFFramework(['status' => 'active']);
    $this->post("/hr/competency-frameworks/{$framework->id}/archive")->assertRedirect();
    $framework->refresh();
    expect($framework->status)->toBe('archived');
});

it('competency_count accessor works', function () {
    $framework = makeCFFramework();
    Competency::create([
        'competency_framework_id' => $framework->id,
        'name' => 'Communication',
    ]);
    Competency::create([
        'competency_framework_id' => $framework->id,
        'name' => 'Problem Solving',
    ]);
    expect($framework->competency_count)->toBe(2);
});

it('destroy soft-deletes the framework', function () {
    $framework = makeCFFramework();
    $this->delete("/hr/competency-frameworks/{$framework->id}")->assertRedirect();
    expect(CompetencyFramework::find($framework->id))->toBeNull();
    expect(CompetencyFramework::withTrashed()->find($framework->id))->not->toBeNull();
});
