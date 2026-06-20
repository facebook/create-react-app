<?php

namespace Database\Seeders;

use App\Modules\Accounting\Models\Account;
use App\Modules\Accounting\Models\JournalEntry;
use App\Modules\Accounting\Models\JournalEntryLine;
use App\Modules\Core\Models\Tenant;
use Illuminate\Database\Seeder;

class AccountingSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();

        if (! $tenant) {
            return;
        }

        // Seed the default chart of accounts for this tenant if not already present.
        Account::seedDefaults($tenant->id);

        $cash     = Account::where('tenant_id', $tenant->id)->where('code', '1000')->first();
        $revenue  = Account::where('tenant_id', $tenant->id)->where('code', '4000')->first();
        $expense  = Account::where('tenant_id', $tenant->id)->where('code', '5000')->first();
        $ap       = Account::where('tenant_id', $tenant->id)->where('code', '2000')->first();

        // Journal Entry 1 — Sales revenue received in cash
        $entry1 = JournalEntry::create([
            'tenant_id'    => $tenant->id,
            'entry_number' => 'JE-2026-00001',
            'reference'    => 'INV-2026-001',
            'description'  => 'Cash received for sales revenue',
            'entry_date'   => '2026-01-15',
            'status'       => 'posted',
            'posted_at'    => now(),
        ]);

        JournalEntryLine::create([
            'journal_entry_id' => $entry1->id,
            'account_id'       => $cash->id,
            'description'      => 'Cash receipt',
            'debit'            => 5000.00,
            'credit'           => 0.00,
        ]);

        JournalEntryLine::create([
            'journal_entry_id' => $entry1->id,
            'account_id'       => $revenue->id,
            'description'      => 'Sales revenue',
            'debit'            => 0.00,
            'credit'           => 5000.00,
        ]);

        // Journal Entry 2 — Operating expense paid in cash
        $entry2 = JournalEntry::create([
            'tenant_id'    => $tenant->id,
            'entry_number' => 'JE-2026-00002',
            'reference'    => 'EXP-2026-001',
            'description'  => 'Operating expenses paid',
            'entry_date'   => '2026-01-20',
            'status'       => 'posted',
            'posted_at'    => now(),
        ]);

        JournalEntryLine::create([
            'journal_entry_id' => $entry2->id,
            'account_id'       => $expense->id,
            'description'      => 'Office supplies expense',
            'debit'            => 1200.00,
            'credit'           => 0.00,
        ]);

        JournalEntryLine::create([
            'journal_entry_id' => $entry2->id,
            'account_id'       => $cash->id,
            'description'      => 'Cash payment',
            'debit'            => 0.00,
            'credit'           => 1200.00,
        ]);
    }
}
