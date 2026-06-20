<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\WriteOff;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'WOcorp', 'slug' => 'wo-corp-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeWriteOff(array $attrs = []): WriteOff
{
    return WriteOff::create([
        'tenant_id'      => test()->tenant->id,
        'amount'         => 500.00,
        'write_off_date' => now()->toDateString(),
        'reason'         => 'bad_debt',
        'created_by'     => test()->admin->id,
        ...$attrs,
    ]);
}

it('index requires authentication', function () {
    $this->post('/logout');
    $this->get('/finance/write-offs')->assertRedirect('/login');
});

it('admin can list write-offs', function () {
    makeWriteOff();
    $this->get('/finance/write-offs')->assertOk();
});

it('store creates a write-off', function () {
    $this->post('/finance/write-offs', [
        'amount'         => 1000.00,
        'write_off_date' => now()->toDateString(),
        'reason'         => 'dispute',
    ])->assertRedirect();

    expect(WriteOff::where('tenant_id', test()->tenant->id)->where('reason', 'dispute')->exists())->toBeTrue();
});

it('store validates required fields', function () {
    $this->postJson('/finance/write-offs', [])->assertStatus(422)->assertJsonValidationErrors(['amount', 'write_off_date', 'reason']);
});

it('show displays a write-off', function () {
    $wo = makeWriteOff();
    $this->get("/finance/write-offs/{$wo->id}")->assertOk();
});

it('approve transitions to approved status', function () {
    $wo = makeWriteOff();
    expect($wo->is_pending)->toBeTrue();

    $this->post("/finance/write-offs/{$wo->id}/approve")->assertRedirect();

    $wo->refresh();
    expect($wo->is_approved)->toBeTrue();
    expect($wo->approved_by)->toBe(test()->admin->id);
    expect($wo->approved_at)->not->toBeNull();
    expect($wo->write_off_number)->not->toBeNull();
});

it('reverse transitions to reversed status', function () {
    $wo = makeWriteOff(['status' => 'approved']);
    $this->post("/finance/write-offs/{$wo->id}/reverse")->assertRedirect();
    $wo->refresh();
    expect($wo->status)->toBe('reversed');
});

it('write_off_number is generated on approval', function () {
    $wo = makeWriteOff();
    $this->post("/finance/write-offs/{$wo->id}/approve")->assertRedirect();
    $wo->refresh();
    expect($wo->write_off_number)->toStartWith('WO-');
});

it('destroy soft-deletes the write-off', function () {
    $wo = makeWriteOff();
    $this->delete("/finance/write-offs/{$wo->id}")->assertRedirect();
    expect(WriteOff::find($wo->id))->toBeNull();
    expect(WriteOff::withTrashed()->find($wo->id))->not->toBeNull();
});
