<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Sign\Models\SignRequest;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Sign Co', 'slug' => 'sign-co']);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

it('returns documents for authenticated user', function () {
    SignRequest::create([
        'tenant_id'     => $this->tenant->id,
        'title'         => 'NDA Agreement',
        'document_name' => 'nda.pdf',
        'document_path' => 'documents/nda.pdf',
        'status'        => 'draft',
        'created_by'    => $this->user->id,
    ]);

    $response = $this->withToken($this->token)->getJson('/api/v1/sign/documents');

    $response->assertStatus(200)
             ->assertJsonStructure(['success', 'data', 'meta']);
});

it('requires authentication for documents', function () {
    $this->getJson('/api/v1/sign/documents')->assertStatus(401);
});
