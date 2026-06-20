<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Documents\Models\Document;
use App\Modules\Documents\Models\DocumentFolder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    Storage::fake('public');
    $this->tenant = Tenant::create(['name' => 'Upload Test Co', 'slug' => 'upload-test-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

// Test 1: Upload page renders
test('upload page renders', function () {
    $this->get('/documents/upload')
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('Documents/Upload')
            ->has('folders')
        );
});

// Test 2: File upload returns JSON with document details
test('file upload returns json with document details', function () {
    $file = UploadedFile::fake()->create('report.pdf', 100, 'application/pdf');

    $response = $this->post('/documents/upload', ['file' => $file]);

    $response->assertStatus(200)
        ->assertJsonStructure(['id', 'title', 'file_name', 'file_size', 'url']);
});

// Test 3: Upload stores file and creates document record
test('upload creates document record in database', function () {
    $file = UploadedFile::fake()->create('invoice.pdf', 200, 'application/pdf');

    $this->post('/documents/upload', ['file' => $file]);

    expect(Document::where('tenant_id', $this->tenant->id)->exists())->toBeTrue();
});

// Test 4: Upload stores file in public disk
test('upload stores file in public storage', function () {
    $file = UploadedFile::fake()->create('contract.docx', 50);

    $this->post('/documents/upload', ['file' => $file]);

    $doc = Document::where('tenant_id', $this->tenant->id)->first();
    expect($doc)->not->toBeNull();
    Storage::disk('public')->assertExists($doc->file_path);
});

// Test 5: Upload with folder_id assigns folder
test('upload with folder id assigns folder to document', function () {
    $folder = DocumentFolder::create([
        'tenant_id'  => $this->tenant->id,
        'name'       => 'Contracts',
        'created_by' => $this->admin->id,
    ]);

    $file = UploadedFile::fake()->create('contract.pdf', 100);

    $this->post('/documents/upload', [
        'file'      => $file,
        'folder_id' => $folder->id,
    ]);

    $doc = Document::where('tenant_id', $this->tenant->id)->first();
    expect($doc->folder_id)->toBe($folder->id);
});

// Test 6: Upload without file fails validation
test('upload without file fails validation', function () {
    $this->postJson('/documents/upload', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['file']);
});

// Test 7: Upload file too large is rejected (>50MB limit)
test('upload file exceeding size limit is rejected', function () {
    $file = UploadedFile::fake()->create('huge.zip', 60000); // 60MB

    $this->postJson('/documents/upload', ['file' => $file])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['file']);
});

// Test 8: Uploaded document title is derived from original filename
test('uploaded document title is derived from filename', function () {
    $file = UploadedFile::fake()->create('my-report.pdf', 50);

    $this->post('/documents/upload', ['file' => $file]);

    $doc = Document::where('tenant_id', $this->tenant->id)->first();
    expect($doc->title)->toBe('my-report');
});

// Test 9: Upload response url points to show route
test('upload response url points to document show route', function () {
    $file = UploadedFile::fake()->create('spec.pdf', 30);

    $response = $this->post('/documents/upload', ['file' => $file]);

    $doc = Document::where('tenant_id', $this->tenant->id)->first();
    $url = $response->json('url');
    expect($url)->toContain("/documents/{$doc->id}");
});

// Test 10: Unauthenticated upload is redirected to login
test('unauthenticated upload is redirected to login', function () {
    auth()->logout();
    $file = UploadedFile::fake()->create('test.pdf', 10);

    $this->post('/documents/upload', ['file' => $file])
        ->assertRedirect('/login');
});
