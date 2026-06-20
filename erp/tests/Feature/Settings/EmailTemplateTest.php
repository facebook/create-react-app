<?php

use App\Models\EmailTemplate;
use App\Models\User;
use App\Modules\Core\Models\Tenant;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Template Co', 'slug' => 'template-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

test('can list email templates and defaults', function () {
    $response = $this->withToken($this->token)->getJson('/api/v1/email-templates');

    $response->assertStatus(200);
    $data = $response->json('data');
    expect($data)->toHaveKey('templates');
    expect($data)->toHaveKey('defaults');
    expect($data['defaults'])->not->toBeEmpty();
});

test('can create a custom email template', function () {
    $response = $this->withToken($this->token)->postJson('/api/v1/email-templates', [
        'key'       => 'invoice_created',
        'name'      => 'Custom Invoice Email',
        'subject'   => 'Your invoice {{ invoice_number }} is ready',
        'body_html' => '<p>Hello {{ customer_name }}, please find your invoice.</p>',
    ]);

    $response->assertStatus(201);
    expect(EmailTemplate::where('key', 'invoice_created')->where('tenant_id', $this->tenant->id)->exists())->toBeTrue();
});

test('store validates key must be a known template', function () {
    $this->withToken($this->token)->postJson('/api/v1/email-templates', [
        'key'       => 'unknown_template',
        'name'      => 'Test',
        'subject'   => 'Test Subject',
        'body_html' => '<p>Test</p>',
    ])->assertStatus(422)->assertJsonValidationErrors(['key']);
});

test('cannot create duplicate template for same tenant', function () {
    EmailTemplate::create([
        'tenant_id' => $this->tenant->id,
        'key'       => 'invoice_created',
        'name'      => 'First',
        'subject'   => 'Invoice',
        'body_html' => '<p>Test</p>',
    ]);

    $this->withToken($this->token)->postJson('/api/v1/email-templates', [
        'key'       => 'invoice_created',
        'name'      => 'Duplicate',
        'subject'   => 'Invoice',
        'body_html' => '<p>Test</p>',
    ])->assertStatus(422)->assertJsonValidationErrors(['key']);
});

test('can update a template', function () {
    $template = EmailTemplate::create([
        'tenant_id' => $this->tenant->id,
        'key'       => 'low_stock_alert',
        'name'      => 'Original',
        'subject'   => 'Old Subject',
        'body_html' => '<p>Old body</p>',
    ]);

    $response = $this->withToken($this->token)->putJson("/api/v1/email-templates/{$template->id}", [
        'subject' => 'New Subject with {{ product_name }}',
    ]);

    $response->assertStatus(200);
    expect($template->fresh()->subject)->toBe('New Subject with {{ product_name }}');
});

test('can delete a template', function () {
    $template = EmailTemplate::create([
        'tenant_id' => $this->tenant->id,
        'key'       => 'payroll_approved',
        'name'      => 'Delete Me',
        'subject'   => 'Subject',
        'body_html' => '<p>body</p>',
    ]);

    $this->withToken($this->token)->deleteJson("/api/v1/email-templates/{$template->id}")
        ->assertStatus(200);

    expect(EmailTemplate::find($template->id))->toBeNull();
});

test('preview renders variables in template', function () {
    $template = EmailTemplate::create([
        'tenant_id' => $this->tenant->id,
        'key'       => 'invoice_created',
        'name'      => 'Invoice',
        'subject'   => 'Invoice #{{ invoice_number }}',
        'body_html' => '<p>Dear {{ customer_name }}, total: {{ total }}</p>',
    ]);

    $response = $this->withToken($this->token)->postJson("/api/v1/email-templates/{$template->id}/preview", [
        'variables' => [
            'invoice_number' => 'INV-001',
            'customer_name'  => 'John Doe',
            'total'          => '$1,500.00',
        ],
    ]);

    $response->assertStatus(200);
    expect($response->json('data.subject'))->toBe('Invoice #INV-001');
    expect($response->json('data.body_html'))->toContain('John Doe');
    expect($response->json('data.body_html'))->toContain('$1,500.00');
});

test('template render method works correctly', function () {
    $template = new EmailTemplate([
        'subject'   => 'Hello {{ name }}',
        'body_html' => '<p>Welcome {{ name }}, your code is {{ code }}.</p>',
    ]);

    $rendered = $template->render(['name' => 'Alice', 'code' => 'XYZ123']);

    expect($rendered['subject'])->toBe('Hello Alice');
    expect($rendered['body_html'])->toContain('Welcome Alice');
    expect($rendered['body_html'])->toContain('XYZ123');
});

test('requires authentication', function () {
    $this->getJson('/api/v1/email-templates')->assertStatus(401);
});
