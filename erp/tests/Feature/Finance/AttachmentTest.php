<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Attachment;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\Project;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    Storage::fake('local');
    $this->tenant = Tenant::create(['name' => 'Attach Co', 'slug' => 'attach-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

test('can upload attachment to invoice', function () {
    $invoice = Invoice::create([
        'tenant_id'     => $this->tenant->id,
        'number'        => 'INV-TEST-001',
        'status'        => 'draft',
        'contact_id'    => Contact::create([
            'tenant_id' => $this->tenant->id, 'name' => 'Test', 'type' => 'customer',
        ])->id,
        'issue_date'    => now()->toDateString(),
        'due_date'      => now()->addDays(30)->toDateString(),
        'currency_code' => 'USD',
        'exchange_rate' => 1,
    ]);

    $file = UploadedFile::fake()->create('invoice.pdf', 100, 'application/pdf');

    $this->post("/finance/attachments/invoices/{$invoice->id}", ['file' => $file])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    expect(Attachment::where('attachable_id', $invoice->id)
        ->where('attachable_type', Invoice::class)
        ->where('tenant_id', $this->tenant->id)
        ->exists())->toBeTrue();
});

test('can upload attachment to project', function () {
    $project = Project::create([
        'tenant_id' => $this->tenant->id,
        'name'      => 'Test Project',
        'status'    => 'active',
    ]);

    $file = UploadedFile::fake()->create('spec.pdf', 50, 'application/pdf');

    $this->post("/finance/attachments/projects/{$project->id}", ['file' => $file])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    expect(Attachment::where('attachable_id', $project->id)
        ->where('attachable_type', Project::class)
        ->where('tenant_id', $this->tenant->id)
        ->exists())->toBeTrue();
});

test('invalid model type returns 404', function () {
    $this->post('/finance/attachments/unknown-model/1', [
        'file' => UploadedFile::fake()->create('test.pdf', 10, 'application/pdf'),
    ])->assertStatus(404);
});

test('unsupported file type rejected', function () {
    $invoice = Invoice::create([
        'tenant_id'     => $this->tenant->id,
        'number'        => 'INV-TEST-002',
        'status'        => 'draft',
        'contact_id'    => Contact::create([
            'tenant_id' => $this->tenant->id, 'name' => 'Test2', 'type' => 'customer',
        ])->id,
        'issue_date'    => now()->toDateString(),
        'due_date'      => now()->addDays(30)->toDateString(),
        'currency_code' => 'USD',
        'exchange_rate' => 1,
    ]);

    $file = UploadedFile::fake()->create('malware.exe', 10, 'application/octet-stream');

    $this->post("/finance/attachments/invoices/{$invoice->id}", ['file' => $file])
        ->assertSessionHasErrors('file');
});

test('file too large rejected', function () {
    $invoice = Invoice::create([
        'tenant_id'     => $this->tenant->id,
        'number'        => 'INV-TEST-003',
        'status'        => 'draft',
        'contact_id'    => Contact::create([
            'tenant_id' => $this->tenant->id, 'name' => 'Test3', 'type' => 'customer',
        ])->id,
        'issue_date'    => now()->toDateString(),
        'due_date'      => now()->addDays(30)->toDateString(),
        'currency_code' => 'USD',
        'exchange_rate' => 1,
    ]);

    // Create a file larger than 20MB (20480 KB)
    $file = UploadedFile::fake()->create('large.pdf', 25000, 'application/pdf');

    $this->post("/finance/attachments/invoices/{$invoice->id}", ['file' => $file])
        ->assertSessionHasErrors('file');
});

test('can delete attachment', function () {
    $invoice = Invoice::create([
        'tenant_id'     => $this->tenant->id,
        'number'        => 'INV-TEST-004',
        'status'        => 'draft',
        'contact_id'    => Contact::create([
            'tenant_id' => $this->tenant->id, 'name' => 'Test4', 'type' => 'customer',
        ])->id,
        'issue_date'    => now()->toDateString(),
        'due_date'      => now()->addDays(30)->toDateString(),
        'currency_code' => 'USD',
        'exchange_rate' => 1,
    ]);

    $fakeFile = UploadedFile::fake()->create('delete-me.pdf', 10, 'application/pdf');
    $path = $fakeFile->store('attachments/invoices/' . $invoice->id, 'local');

    $attachment = Attachment::create([
        'tenant_id'       => $this->tenant->id,
        'attachable_type' => Invoice::class,
        'attachable_id'   => $invoice->id,
        'filename'        => 'delete-me.pdf',
        'disk'            => 'local',
        'path'            => $path,
        'mime_type'       => 'application/pdf',
        'size'            => 10240,
        'uploaded_by'     => $this->admin->id,
    ]);

    $this->delete("/finance/attachments/{$attachment->id}")
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    expect(Attachment::find($attachment->id))->toBeNull();
    Storage::disk('local')->assertMissing($path);
});

test('can download attachment', function () {
    $invoice = Invoice::create([
        'tenant_id'     => $this->tenant->id,
        'number'        => 'INV-TEST-005',
        'status'        => 'draft',
        'contact_id'    => Contact::create([
            'tenant_id' => $this->tenant->id, 'name' => 'Test5', 'type' => 'customer',
        ])->id,
        'issue_date'    => now()->toDateString(),
        'due_date'      => now()->addDays(30)->toDateString(),
        'currency_code' => 'USD',
        'exchange_rate' => 1,
    ]);

    $fakeFile = UploadedFile::fake()->create('test.pdf', 100, 'application/pdf');
    $path = $fakeFile->store('attachments/invoices/' . $invoice->id, 'local');

    $attachment = Attachment::create([
        'tenant_id'       => $this->tenant->id,
        'attachable_type' => Invoice::class,
        'attachable_id'   => $invoice->id,
        'filename'        => 'test.pdf',
        'disk'            => 'local',
        'path'            => $path,
        'mime_type'       => 'application/pdf',
        'size'            => 102400,
        'uploaded_by'     => $this->admin->id,
    ]);

    $this->get("/finance/attachments/{$attachment->id}/download")
        ->assertStatus(200);
});

test('staff cannot delete attachment', function () {
    $invoice = Invoice::create([
        'tenant_id'     => $this->tenant->id,
        'number'        => 'INV-TEST-006',
        'status'        => 'draft',
        'contact_id'    => Contact::create([
            'tenant_id' => $this->tenant->id, 'name' => 'Test6', 'type' => 'customer',
        ])->id,
        'issue_date'    => now()->toDateString(),
        'due_date'      => now()->addDays(30)->toDateString(),
        'currency_code' => 'USD',
        'exchange_rate' => 1,
    ]);

    $fakeFile = UploadedFile::fake()->create('protected.pdf', 10, 'application/pdf');
    $path = $fakeFile->store('attachments/invoices/' . $invoice->id, 'local');

    $attachment = Attachment::create([
        'tenant_id'       => $this->tenant->id,
        'attachable_type' => Invoice::class,
        'attachable_id'   => $invoice->id,
        'filename'        => 'protected.pdf',
        'disk'            => 'local',
        'path'            => $path,
        'mime_type'       => 'application/pdf',
        'size'            => 10240,
        'uploaded_by'     => $this->admin->id,
    ]);

    $this->actingAs($this->staff)
        ->delete("/finance/attachments/{$attachment->id}")
        ->assertStatus(403);
});

test('attachment belongs to correct tenant', function () {
    $invoice = Invoice::create([
        'tenant_id'     => $this->tenant->id,
        'number'        => 'INV-TEST-007',
        'status'        => 'draft',
        'contact_id'    => Contact::create([
            'tenant_id' => $this->tenant->id, 'name' => 'Test7', 'type' => 'customer',
        ])->id,
        'issue_date'    => now()->toDateString(),
        'due_date'      => now()->addDays(30)->toDateString(),
        'currency_code' => 'USD',
        'exchange_rate' => 1,
    ]);

    $file = UploadedFile::fake()->create('tenant-check.pdf', 10, 'application/pdf');

    $this->post("/finance/attachments/invoices/{$invoice->id}", ['file' => $file])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $attachment = Attachment::where('attachable_id', $invoice->id)
        ->where('attachable_type', Invoice::class)
        ->first();

    expect($attachment)->not->toBeNull();
    expect($attachment->tenant_id)->toBe($this->tenant->id);
});
