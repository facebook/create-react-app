<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Account;
use App\Modules\Finance\Models\JournalEntry;
use App\Modules\Finance\Models\JournalLine;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant  = Tenant::create(['name' => 'Test Co', 'slug' => 'test-co']);
    $this->admin   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');

    $this->cash    = Account::create(['tenant_id' => $this->tenant->id, 'code' => '1101', 'name' => 'Cash',    'type' => 'asset']);
    $this->revenue = Account::create(['tenant_id' => $this->tenant->id, 'code' => '4100', 'name' => 'Revenue', 'type' => 'income']);
});

test('journal entry index is accessible', function () {
    $this->actingAs($this->admin)
        ->get('/finance/journal-entries')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Finance/JournalEntries/Index'));
});

test('journal entry can be created via http', function () {
    $this->actingAs($this->admin)
        ->post('/finance/journal-entries', [
            'date'        => '2026-01-15',
            'description' => 'Cash sale',
            'lines'       => [
                ['account_id' => $this->cash->id,    'debit' => 100, 'credit' => 0],
                ['account_id' => $this->revenue->id, 'debit' => 0,   'credit' => 100],
            ],
        ])
        ->assertRedirect();

    expect(JournalEntry::where('description', 'Cash sale')->exists())->toBeTrue();
});

test('journal entry starts in draft status', function () {
    $entry = JournalEntry::create([
        'tenant_id'   => $this->tenant->id,
        'date'        => now()->toDateString(),
        'description' => 'Test entry',
    ]);

    expect($entry->status)->toBe('draft');
});

test('balanced journal entry can be posted', function () {
    $entry = JournalEntry::create([
        'tenant_id'   => $this->tenant->id,
        'date'        => now()->toDateString(),
        'description' => 'Test entry',
    ]);

    JournalLine::create(['journal_entry_id' => $entry->id, 'account_id' => $this->cash->id,    'debit' => 500, 'credit' => 0]);
    JournalLine::create(['journal_entry_id' => $entry->id, 'account_id' => $this->revenue->id, 'debit' => 0,   'credit' => 500]);

    $entry->load('lines');
    $entry->post();

    expect($entry->fresh()->status)->toBe('posted');
});

test('unbalanced journal entry cannot be posted', function () {
    $entry = JournalEntry::create([
        'tenant_id'   => $this->tenant->id,
        'date'        => now()->toDateString(),
        'description' => 'Unbalanced',
    ]);

    JournalLine::create(['journal_entry_id' => $entry->id, 'account_id' => $this->cash->id, 'debit' => 100, 'credit' => 0]);
    JournalLine::create(['journal_entry_id' => $entry->id, 'account_id' => $this->revenue->id, 'debit' => 0, 'credit' => 50]);

    $entry->load('lines');

    expect(fn () => $entry->post())->toThrow(\DomainException::class);
});

test('posted entry cannot be posted again', function () {
    $entry = JournalEntry::create([
        'tenant_id' => $this->tenant->id, 'date' => now()->toDateString(), 'description' => 'Test',
    ]);
    JournalLine::create(['journal_entry_id' => $entry->id, 'account_id' => $this->cash->id,    'debit' => 200, 'credit' => 0]);
    JournalLine::create(['journal_entry_id' => $entry->id, 'account_id' => $this->revenue->id, 'debit' => 0,   'credit' => 200]);
    $entry->load('lines');
    $entry->post();

    expect(fn () => $entry->post())->toThrow(\DomainException::class);
});

test('post endpoint works via http', function () {
    $entry = JournalEntry::create([
        'tenant_id' => $this->tenant->id, 'date' => now()->toDateString(), 'description' => 'Test',
    ]);
    JournalLine::create(['journal_entry_id' => $entry->id, 'account_id' => $this->cash->id,    'debit' => 300, 'credit' => 0]);
    JournalLine::create(['journal_entry_id' => $entry->id, 'account_id' => $this->revenue->id, 'debit' => 0,   'credit' => 300]);

    $this->actingAs($this->admin)
        ->patch("/finance/journal-entries/{$entry->id}/post")
        ->assertRedirect();

    expect($entry->fresh()->status)->toBe('posted');
});
