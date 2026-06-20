<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\DocumentTemplate;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Doc Co', 'slug' => 'doc-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

it('admin can list document templates', function () {
    $this->get('/finance/document-templates')->assertStatus(200);
});

it('admin can create a document template', function () {
    $this->post('/finance/document-templates', [
        'name' => 'Standard Invoice',
        'type' => 'invoice',
        'body' => '<p>Invoice {{invoice_number}} for {{client_name}}</p>',
    ])->assertRedirect();
    expect(DocumentTemplate::where('name', 'Standard Invoice')->exists())->toBeTrue();
});

it('admin can view document template', function () {
    $tpl = DocumentTemplate::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Test Template',
        'type'      => 'invoice',
        'body'      => '<p>Hello {{name}}</p>',
    ]);
    $this->get("/finance/document-templates/{$tpl->id}")->assertStatus(200);
});

it('render method substitutes variables', function () {
    $tpl = DocumentTemplate::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Render Test',
        'type'      => 'invoice',
        'body'      => 'Dear {{client_name}}, your invoice is {{invoice_number}}.',
    ]);
    $rendered = $tpl->render([
        'client_name'    => 'Acme Corp',
        'invoice_number' => 'INV-001',
    ]);
    expect($rendered)->toBe('Dear Acme Corp, your invoice is INV-001.');
});

it('render leaves unknown variables as-is', function () {
    $tpl = DocumentTemplate::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Render Test 2',
        'type'      => 'quote',
        'body'      => 'Hello {{name}} and {{unknown}}.',
    ]);
    $rendered = $tpl->render(['name' => 'Bob']);
    expect($rendered)->toBe('Hello Bob and {{unknown}}.');
});

it('admin can update document template', function () {
    $tpl = DocumentTemplate::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Old Name',
        'type'      => 'letter',
        'body'      => 'Old body',
    ]);
    $this->patch("/finance/document-templates/{$tpl->id}", [
        'name' => 'New Name',
        'type' => 'letter',
        'body' => 'New body',
    ])->assertRedirect();
    expect($tpl->fresh()->name)->toBe('New Name');
});

it('admin can delete document template', function () {
    $tpl = DocumentTemplate::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Deletable',
        'type'      => 'receipt',
        'body'      => 'Hello',
    ]);
    $this->delete("/finance/document-templates/{$tpl->id}")->assertRedirect();
    expect(DocumentTemplate::find($tpl->id))->toBeNull();
});

it('type must be valid', function () {
    $this->postJson('/finance/document-templates', [
        'name' => 'Bad Type',
        'type' => 'invalid_type',
        'body' => 'content',
    ])->assertStatus(422);
});

it('staff cannot delete document template', function () {
    $tpl = DocumentTemplate::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Staff Test',
        'type'      => 'invoice',
        'body'      => 'Hello',
    ]);
    $this->actingAs($this->staff)
        ->delete("/finance/document-templates/{$tpl->id}")
        ->assertStatus(403);
});

it('variables are stored as array', function () {
    $this->post('/finance/document-templates', [
        'name'      => 'Vars Template',
        'type'      => 'invoice',
        'body'      => '{{foo}} {{bar}}',
        'variables' => ['foo', 'bar'],
    ])->assertRedirect();
    $tpl = DocumentTemplate::where('name', 'Vars Template')->first();
    expect($tpl->variables)->toBe(['foo', 'bar']);
});
