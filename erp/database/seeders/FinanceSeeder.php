<?php

namespace Database\Seeders;

use App\Modules\Core\Models\Tenant;
use App\Modules\Finance\Models\Account;
use App\Modules\Finance\Models\Contact;
use Illuminate\Database\Seeder;

class FinanceSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();

        if (! $tenant) {
            return;
        }

        // Chart of Accounts — standard structure
        $accounts = [
            // Assets
            ['code' => '1000', 'name' => 'Assets',                  'type' => 'asset'],
            ['code' => '1100', 'name' => 'Cash and Bank',            'type' => 'asset',     'parent' => '1000'],
            ['code' => '1101', 'name' => 'Main Bank Account',        'type' => 'asset',     'parent' => '1100'],
            ['code' => '1102', 'name' => 'Petty Cash',               'type' => 'asset',     'parent' => '1100'],
            ['code' => '1200', 'name' => 'Accounts Receivable',      'type' => 'asset',     'parent' => '1000'],
            ['code' => '1300', 'name' => 'Inventory',                'type' => 'asset',     'parent' => '1000'],
            ['code' => '1400', 'name' => 'Prepaid Expenses',         'type' => 'asset',     'parent' => '1000'],

            // Liabilities
            ['code' => '2000', 'name' => 'Liabilities',              'type' => 'liability'],
            ['code' => '2100', 'name' => 'Accounts Payable',         'type' => 'liability', 'parent' => '2000'],
            ['code' => '2200', 'name' => 'Accrued Liabilities',      'type' => 'liability', 'parent' => '2000'],
            ['code' => '2300', 'name' => 'Tax Payable',              'type' => 'liability', 'parent' => '2000'],

            // Equity
            ['code' => '3000', 'name' => 'Equity',                   'type' => 'equity'],
            ['code' => '3100', 'name' => "Owner's Capital",          'type' => 'equity',    'parent' => '3000'],
            ['code' => '3200', 'name' => 'Retained Earnings',        'type' => 'equity',    'parent' => '3000'],

            // Income
            ['code' => '4000', 'name' => 'Revenue',                  'type' => 'income'],
            ['code' => '4100', 'name' => 'Sales Revenue',            'type' => 'income',    'parent' => '4000'],
            ['code' => '4200', 'name' => 'Service Revenue',          'type' => 'income',    'parent' => '4000'],
            ['code' => '4900', 'name' => 'Other Income',             'type' => 'income',    'parent' => '4000'],

            // Expenses
            ['code' => '5000', 'name' => 'Expenses',                 'type' => 'expense'],
            ['code' => '5100', 'name' => 'Cost of Goods Sold',       'type' => 'expense',   'parent' => '5000'],
            ['code' => '5200', 'name' => 'Salaries & Wages',         'type' => 'expense',   'parent' => '5000'],
            ['code' => '5300', 'name' => 'Rent & Occupancy',         'type' => 'expense',   'parent' => '5000'],
            ['code' => '5400', 'name' => 'Utilities',                'type' => 'expense',   'parent' => '5000'],
            ['code' => '5500', 'name' => 'Marketing & Advertising',  'type' => 'expense',   'parent' => '5000'],
            ['code' => '5900', 'name' => 'Miscellaneous Expenses',   'type' => 'expense',   'parent' => '5000'],
        ];

        $created = [];
        foreach ($accounts as $data) {
            $parentId = isset($data['parent']) ? ($created[$data['parent']] ?? null) : null;
            $account  = Account::create([
                'tenant_id'   => $tenant->id,
                'code'        => $data['code'],
                'name'        => $data['name'],
                'type'        => $data['type'],
                'parent_id'   => $parentId,
            ]);
            $created[$data['code']] = $account->id;
        }

        // Sample contacts
        Contact::create(['tenant_id' => $tenant->id, 'name' => 'Acme Corp',       'email' => 'billing@acme.example',   'type' => 'customer']);
        Contact::create(['tenant_id' => $tenant->id, 'name' => 'Globex LLC',      'email' => 'accounts@globex.example', 'type' => 'customer']);
        Contact::create(['tenant_id' => $tenant->id, 'name' => 'Office Supplies Co', 'email' => 'ap@officesup.example','type' => 'vendor']);
        Contact::create(['tenant_id' => $tenant->id, 'name' => 'Cloud Services Ltd', 'email' => 'invoices@cloud.example','type' => 'both']);
    }
}
