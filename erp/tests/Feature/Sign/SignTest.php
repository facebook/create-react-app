<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Sign\Models\SignRequest;
use App\Modules\Sign\Models\SignRequestSigner;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Sign Corp', 'slug' => 'sign-corp-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->actingAs($this->user);
    app()->instance('tenant', $this->tenant);
});

// Helper to create a sign request
function makeSignRequest(array $attrs = []): SignRequest
{
    return SignRequest::create(array_merge([
        'tenant_id'     => test()->tenant->id,
        'title'         => 'Test Document ' . uniqid(),
        'document_path' => '/documents/test.pdf',
        'document_name' => 'test.pdf',
        'status'        => 'draft',
        'created_by'    => test()->user->id,
    ], $attrs));
}

// Helper to create a signer
function makeSignRequestSigner(SignRequest $signRequest, array $attrs = []): SignRequestSigner
{
    $signer = new SignRequestSigner(array_merge([
        'sign_request_id' => $signRequest->id,
        'tenant_id'       => $signRequest->tenant_id,
        'signer_name'     => 'John Doe',
        'signer_email'    => 'john@example.com',
        'sequence'        => 0,
        'status'          => 'pending',
    ], $attrs));
    $signer->token = $signer->generateToken();
    $signer->save();
    return $signer;
}

// 1. Lists sign requests
it('lists sign requests', function () {
    makeSignRequest();
    $this->get('/sign')->assertOk();
});

// 2. Creates a sign request with signers
it('creates a sign request with signers', function () {
    $this->post('/sign', [
        'title'         => 'NDA Agreement',
        'document_path' => '/documents/nda.pdf',
        'document_name' => 'nda.pdf',
        'message'       => 'Please sign the NDA.',
        'signers'       => [
            ['name' => 'Alice Smith', 'email' => 'alice@example.com', 'sequence' => 1],
            ['name' => 'Bob Jones',   'email' => 'bob@example.com',   'sequence' => 2],
        ],
    ])->assertRedirect();

    $request = SignRequest::where('title', 'NDA Agreement')->first();
    expect($request)->not->toBeNull();
    expect($request->status)->toBe('draft');
    expect($request->signers()->count())->toBe(2);
});

// 3. Shows a sign request
it('shows a sign request', function () {
    $signRequest = makeSignRequest();
    $this->get("/sign/{$signRequest->id}")->assertOk();
});

// 4. Sends a request
it('sends a request', function () {
    $signRequest = makeSignRequest();
    makeSignRequestSigner($signRequest);

    $this->post("/sign/{$signRequest->id}/send")->assertRedirect();

    $signRequest->refresh();
    expect($signRequest->status)->toBe('sent');

    $signer = $signRequest->signers()->first();
    expect($signer->token)->not->toBeNull();
});

// 5. Cancels a request
it('cancels a request', function () {
    $signRequest = makeSignRequest(['status' => 'sent']);
    makeSignRequestSigner($signRequest);

    $this->post("/sign/{$signRequest->id}/cancel")->assertRedirect();

    expect($signRequest->fresh()->status)->toBe('cancelled');
});

// 6. Adds a signer to draft request
it('adds a signer to draft request', function () {
    $signRequest = makeSignRequest();

    $this->post("/sign/{$signRequest->id}/signers", [
        'signer_name'  => 'Carol White',
        'signer_email' => 'carol@example.com',
        'sequence'     => 1,
    ])->assertRedirect();

    $signer = SignRequestSigner::where('sign_request_id', $signRequest->id)->first();
    expect($signer)->not->toBeNull();
    expect($signer->signer_name)->toBe('Carol White');
});

// 7. Removes a signer from draft request
it('removes a signer from draft request', function () {
    $signRequest = makeSignRequest();
    $signer      = makeSignRequestSigner($signRequest);

    $this->delete("/sign/{$signRequest->id}/signers/{$signer->id}")->assertRedirect();

    expect(SignRequestSigner::find($signer->id))->toBeNull();
});

// 8. Signer signs
it('signer signs', function () {
    $signRequest = makeSignRequest(['status' => 'sent']);
    $signer      = makeSignRequestSigner($signRequest);

    $this->post("/sign/{$signRequest->id}/signers/{$signer->id}/sign")->assertRedirect();

    $signer->refresh();
    expect($signer->status)->toBe('signed');
    expect($signer->signed_at)->not->toBeNull();
});

// 9. Auto-completes when all signers sign
it('auto-completes when all signers sign', function () {
    $signRequest = makeSignRequest(['status' => 'sent']);
    $signer      = makeSignRequestSigner($signRequest);

    $this->post("/sign/{$signRequest->id}/signers/{$signer->id}/sign")->assertRedirect();

    $signRequest->refresh();
    expect($signRequest->status)->toBe('completed');
});

// 10. Signer declines
it('signer declines', function () {
    $signRequest = makeSignRequest(['status' => 'sent']);
    $signer      = makeSignRequestSigner($signRequest);

    $this->post("/sign/{$signRequest->id}/signers/{$signer->id}/decline")->assertRedirect();

    $signer->refresh();
    expect($signer->status)->toBe('declined');
});
