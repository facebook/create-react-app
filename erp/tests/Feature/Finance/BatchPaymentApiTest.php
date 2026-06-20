<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\BatchPayment;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\Payment;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Pay Co', 'slug' => 'pay-co-' . uniqid()]);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

function makeBatchInvoice(): Invoice
{
    $contact = Contact::create([
        'tenant_id' => test()->tenant->id,
        'name'      => 'Batch Client ' . uniqid(),
        'type'      => 'customer',
    ]);

    return Invoice::create([
        'tenant_id'  => test()->tenant->id,
        'contact_id' => $contact->id,
        'issue_date' => now()->toDateString(),
        'due_date'   => now()->addDays(30)->toDateString(),
        'status'     => 'sent',
    ]);
}

test('can create a batch payment', function () {
    $inv1 = makeBatchInvoice();
    $inv2 = makeBatchInvoice();

    $this->withToken($this->token)
        ->postJson('/api/v1/batch-payments', [
            'payment_date'   => now()->toDateString(),
            'payment_method' => 'bank_transfer',
            'type'           => 'received',
            'payments'       => [
                ['invoice_id' => $inv1->id, 'amount' => 500.00],
                ['invoice_id' => $inv2->id, 'amount' => 750.00],
            ],
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.type', 'received')
        ->assertJsonStructure(['data' => ['reference', 'total_amount', 'payments']]);

    expect(Payment::where('invoice_id', $inv1->id)->exists())->toBeTrue();
    expect(Payment::where('invoice_id', $inv2->id)->exists())->toBeTrue();
});

test('total_amount is sum of individual payments', function () {
    $inv1 = makeBatchInvoice();
    $inv2 = makeBatchInvoice();

    $response = $this->withToken($this->token)
        ->postJson('/api/v1/batch-payments', [
            'payment_date'   => now()->toDateString(),
            'payment_method' => 'cash',
            'type'           => 'received',
            'payments'       => [
                ['invoice_id' => $inv1->id, 'amount' => 200.00],
                ['invoice_id' => $inv2->id, 'amount' => 300.00],
            ],
        ])
        ->assertStatus(201);

    expect((float) $response->json('data.total_amount'))->toBe(500.0);
});

test('can list batch payments', function () {
    $inv = makeBatchInvoice();
    BatchPayment::create([
        'tenant_id'      => $this->tenant->id,
        'reference'      => 'BATCH-001',
        'payment_date'   => now()->toDateString(),
        'payment_method' => 'bank_transfer',
        'type'           => 'received',
        'total_amount'   => 1000.00,
    ]);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/batch-payments')
        ->assertStatus(200);

    expect(count($response->json('data')))->toBeGreaterThanOrEqual(1);
});

test('can view a batch payment with individual payments', function () {
    $inv = makeBatchInvoice();

    $batch = BatchPayment::create([
        'tenant_id'      => $this->tenant->id,
        'reference'      => 'BATCH-002',
        'payment_date'   => now()->toDateString(),
        'payment_method' => 'cheque',
        'type'           => 'made',
        'total_amount'   => 500.00,
    ]);

    Payment::create([
        'tenant_id'       => $this->tenant->id,
        'invoice_id'      => $inv->id,
        'batch_payment_id' => $batch->id,
        'amount'          => 500.00,
        'payment_date'    => now()->toDateString(),
        'method'          => 'cheque',
    ]);

    $this->withToken($this->token)
        ->getJson("/api/v1/batch-payments/{$batch->id}")
        ->assertStatus(200)
        ->assertJsonStructure(['data' => ['reference', 'payments']]);
});

test('can filter by type', function () {
    BatchPayment::create([
        'tenant_id'      => $this->tenant->id,
        'reference'      => 'BATCH-REC',
        'payment_date'   => now()->toDateString(),
        'payment_method' => 'cash',
        'type'           => 'received',
        'total_amount'   => 100.00,
    ]);

    BatchPayment::create([
        'tenant_id'      => $this->tenant->id,
        'reference'      => 'BATCH-MADE',
        'payment_date'   => now()->toDateString(),
        'payment_method' => 'cash',
        'type'           => 'made',
        'total_amount'   => 200.00,
    ]);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/batch-payments?type=received')
        ->assertStatus(200);

    foreach ($response->json('data') as $item) {
        expect($item['type'])->toBe('received');
    }
});

test('can get batch payment summary', function () {
    BatchPayment::create([
        'tenant_id'      => $this->tenant->id,
        'reference'      => 'BATCH-SUM-1',
        'payment_date'   => now()->toDateString(),
        'payment_method' => 'bank_transfer',
        'type'           => 'received',
        'total_amount'   => 1000.00,
    ]);

    $response = $this->withToken($this->token)
        ->getJson('/api/v1/batch-payments/summary')
        ->assertStatus(200)
        ->assertJsonStructure(['data' => ['total_received', 'total_made', 'batch_count_received']]);

    expect((float) $response->json('data.total_received'))->toBeGreaterThanOrEqual(1000.0);
});

test('can delete a batch payment', function () {
    $batch = BatchPayment::create([
        'tenant_id'      => $this->tenant->id,
        'reference'      => 'BATCH-DEL',
        'payment_date'   => now()->toDateString(),
        'payment_method' => 'cash',
        'type'           => 'received',
        'total_amount'   => 100.00,
    ]);

    $this->withToken($this->token)
        ->deleteJson("/api/v1/batch-payments/{$batch->id}")
        ->assertStatus(200);

    expect(BatchPayment::withTrashed()->find($batch->id)?->deleted_at)->not->toBeNull();
});

test('requires authentication', function () {
    $this->getJson('/api/v1/batch-payments')->assertStatus(401);
});
