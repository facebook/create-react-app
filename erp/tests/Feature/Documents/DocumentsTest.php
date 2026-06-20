<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Documents\Models\Document;
use App\Modules\Documents\Models\DocumentFolder;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Documents Corp', 'slug' => 'documents-corp-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->actingAs($this->user);
    app()->instance('tenant', $this->tenant);
});

// Helper to create a folder
function makeFolder(array $attrs = []): DocumentFolder
{
    return DocumentFolder::create(array_merge([
        'tenant_id'  => test()->tenant->id,
        'name'       => 'Folder ' . uniqid(),
        'created_by' => test()->user->id,
    ], $attrs));
}

// Helper to create a document
function makeDocument(array $attrs = []): Document
{
    return Document::create(array_merge([
        'tenant_id'   => test()->tenant->id,
        'title'       => 'Document ' . uniqid(),
        'file_path'   => '/uploads/test-' . uniqid() . '.pdf',
        'file_name'   => 'test.pdf',
        'file_size'   => 1024,
        'version'     => 1,
        'uploaded_by' => test()->user->id,
    ], $attrs));
}

// 1. Lists documents
it('lists documents', function () {
    makeDocument();
    $this->get('/documents')->assertOk();
});

// 2. Lists folders
it('lists folders', function () {
    makeFolder();
    $this->get('/documents/folders')->assertOk();
});

// 3. Creates a folder
it('creates a folder', function () {
    $this->post('/documents/folders', [
        'name' => 'Finance Documents',
    ])->assertRedirect();

    $folder = DocumentFolder::where('name', 'Finance Documents')->first();
    expect($folder)->not->toBeNull();
});

// 4. Creates a document
it('creates a document', function () {
    $this->post('/documents', [
        'title'     => 'Annual Report 2024',
        'file_path' => '/uploads/annual-report-2024.pdf',
        'file_name' => 'annual-report-2024.pdf',
    ])->assertRedirect();

    $document = Document::where('title', 'Annual Report 2024')->first();
    expect($document)->not->toBeNull();
    expect($document->version)->toBe(1);
});

// 5. Shows a document
it('shows a document', function () {
    $document = makeDocument();
    $this->get("/documents/{$document->id}")->assertOk();
});

// 6. Updates a document
it('updates a document', function () {
    $document = makeDocument(['title' => 'Old Title']);

    $this->patch("/documents/{$document->id}", [
        'title' => 'New Title',
    ])->assertRedirect();

    expect($document->fresh()->title)->toBe('New Title');
});

// 7. Adds a new version
it('adds a new version', function () {
    $document = makeDocument(['version' => 1]);

    $this->post("/documents/{$document->id}/versions", [
        'file_path' => '/uploads/document-v2.pdf',
        'file_name' => 'document-v2.pdf',
        'notes'     => 'Updated content',
    ])->assertRedirect();

    expect($document->fresh()->version)->toBe(2);
});

// 8. Soft deletes a document
it('soft deletes a document', function () {
    $document = makeDocument();

    $this->delete("/documents/{$document->id}")->assertRedirect();

    $found = Document::find($document->id);
    expect($found)->toBeNull();
});

// 9. Searches documents by title
it('searches documents by title', function () {
    $uniqueTitle = 'UniqueXYZ' . uniqid();
    makeDocument(['title' => $uniqueTitle]);

    $this->get("/documents/search?q={$uniqueTitle}")->assertOk();

    $response = $this->get("/documents/search?q={$uniqueTitle}");
    $response->assertOk();
});

// 10. Deletes a folder
it('deletes a folder', function () {
    $folder = makeFolder();

    $this->delete("/documents/folders/{$folder->id}")->assertRedirect();

    $found = DocumentFolder::find($folder->id);
    expect($found)->toBeNull();
});
