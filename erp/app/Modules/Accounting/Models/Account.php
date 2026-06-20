<?php

namespace App\Modules\Accounting\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Account extends Model
{
    use BelongsToTenant;

    protected $table = 'chart_of_accounts';

    protected $fillable = [
        'tenant_id', 'code', 'name', 'type', 'sub_type', 'parent_id',
        'is_active', 'normal_balance', 'description',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // ─── Relations ───────────────────────────────────────────────────────────

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Account::class, 'parent_id');
    }

    public function lines(): HasMany
    {
        return $this->hasMany(JournalEntryLine::class, 'account_id');
    }

    public function balances(): HasMany
    {
        return $this->hasMany(AccountBalance::class, 'account_id');
    }

    // ─── Business Logic ───────────────────────────────────────────────────────

    public function isDebitNormal(): bool
    {
        return $this->normal_balance === 'debit';
    }

    public function getBalance(?int $periodId = null): float
    {
        $query = $this->lines()
            ->whereHas('journalEntry', fn ($q) => $q->where('status', 'posted'));

        if ($periodId !== null) {
            $query->whereHas('journalEntry', fn ($q) => $q->where('period_id', $periodId));
        }

        $debits  = (float) $query->sum('debit');
        $credits = (float) $query->sum('credit');

        return $this->isDebitNormal()
            ? $debits - $credits
            : $credits - $debits;
    }

    // ─── Default Chart of Accounts ─────────────────────────────────────────────

    public static function defaultChart(int $tenantId): array
    {
        return [
            // Assets
            ['tenant_id' => $tenantId, 'code' => '1000', 'name' => 'Cash',                       'type' => 'asset',     'sub_type' => 'cash',                  'normal_balance' => 'debit'],
            ['tenant_id' => $tenantId, 'code' => '1100', 'name' => 'Accounts Receivable',         'type' => 'asset',     'sub_type' => 'accounts_receivable',   'normal_balance' => 'debit'],
            ['tenant_id' => $tenantId, 'code' => '1200', 'name' => 'Inventory',                   'type' => 'asset',     'sub_type' => 'inventory',             'normal_balance' => 'debit'],
            ['tenant_id' => $tenantId, 'code' => '1500', 'name' => 'Fixed Assets',                'type' => 'asset',     'sub_type' => 'fixed_asset',           'normal_balance' => 'debit'],
            ['tenant_id' => $tenantId, 'code' => '1600', 'name' => 'Accumulated Depreciation',    'type' => 'asset',     'sub_type' => 'accumulated_depreciation', 'normal_balance' => 'credit'],
            // Liabilities
            ['tenant_id' => $tenantId, 'code' => '2000', 'name' => 'Accounts Payable',            'type' => 'liability', 'sub_type' => 'accounts_payable',      'normal_balance' => 'credit'],
            ['tenant_id' => $tenantId, 'code' => '2100', 'name' => 'Accrued Liabilities',         'type' => 'liability', 'sub_type' => 'accrued_liabilities',   'normal_balance' => 'credit'],
            ['tenant_id' => $tenantId, 'code' => '2200', 'name' => 'Sales Tax Payable',           'type' => 'liability', 'sub_type' => 'tax_payable',           'normal_balance' => 'credit'],
            ['tenant_id' => $tenantId, 'code' => '2300', 'name' => 'Short-term Loans',            'type' => 'liability', 'sub_type' => 'short_term_debt',       'normal_balance' => 'credit'],
            // Equity
            ['tenant_id' => $tenantId, 'code' => '3000', 'name' => "Owner's Equity",             'type' => 'equity',    'sub_type' => 'owners_equity',         'normal_balance' => 'credit'],
            ['tenant_id' => $tenantId, 'code' => '3100', 'name' => 'Retained Earnings',           'type' => 'equity',    'sub_type' => 'retained_earnings',     'normal_balance' => 'credit'],
            ['tenant_id' => $tenantId, 'code' => '3200', 'name' => 'Common Stock',                'type' => 'equity',    'sub_type' => 'common_stock',          'normal_balance' => 'credit'],
            // Revenue
            ['tenant_id' => $tenantId, 'code' => '4000', 'name' => 'Sales Revenue',              'type' => 'revenue',   'sub_type' => 'sales',                 'normal_balance' => 'credit'],
            ['tenant_id' => $tenantId, 'code' => '4100', 'name' => 'Service Revenue',             'type' => 'revenue',   'sub_type' => 'service',               'normal_balance' => 'credit'],
            ['tenant_id' => $tenantId, 'code' => '4200', 'name' => 'Other Revenue',               'type' => 'revenue',   'sub_type' => 'other_revenue',         'normal_balance' => 'credit'],
            // Expenses
            ['tenant_id' => $tenantId, 'code' => '5000', 'name' => 'Cost of Goods Sold',         'type' => 'expense',   'sub_type' => 'cogs',                  'normal_balance' => 'debit'],
            ['tenant_id' => $tenantId, 'code' => '5100', 'name' => 'Salaries Expense',            'type' => 'expense',   'sub_type' => 'salaries',              'normal_balance' => 'debit'],
            ['tenant_id' => $tenantId, 'code' => '5200', 'name' => 'Rent Expense',                'type' => 'expense',   'sub_type' => 'rent',                  'normal_balance' => 'debit'],
            ['tenant_id' => $tenantId, 'code' => '5300', 'name' => 'Utilities Expense',           'type' => 'expense',   'sub_type' => 'utilities',             'normal_balance' => 'debit'],
            ['tenant_id' => $tenantId, 'code' => '5400', 'name' => 'Marketing Expense',           'type' => 'expense',   'sub_type' => 'marketing',             'normal_balance' => 'debit'],
            ['tenant_id' => $tenantId, 'code' => '5500', 'name' => 'Depreciation Expense',        'type' => 'expense',   'sub_type' => 'depreciation',          'normal_balance' => 'debit'],
            ['tenant_id' => $tenantId, 'code' => '5900', 'name' => 'Other Expenses',              'type' => 'expense',   'sub_type' => 'other_expense',         'normal_balance' => 'debit'],
        ];
    }

    public static function seedDefaults(int $tenantId): void
    {
        $existing = static::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->pluck('code')
            ->toArray();

        foreach (static::defaultChart($tenantId) as $account) {
            if (! in_array($account['code'], $existing, true)) {
                static::create($account);
            }
        }
    }

    // ─── Scopes ──────────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
