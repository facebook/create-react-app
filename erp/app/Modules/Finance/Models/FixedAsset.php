<?php

namespace App\Modules\Finance\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use DomainException;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class FixedAsset extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'name',
        'code',
        'category',
        'description',
        'purchase_date',
        'purchase_cost',
        'salvage_value',
        'useful_life_years',
        'accumulated_depreciation',
        'status',
        'disposal_date',
        'disposal_proceeds',
        'asset_account_id',
        'depreciation_account_id',
        'created_by',
    ];

    protected $casts = [
        'purchase_date'            => 'date',
        'disposal_date'            => 'date',
        'purchase_cost'            => 'float',
        'salvage_value'            => 'float',
        'accumulated_depreciation' => 'float',
        'disposal_proceeds'        => 'float',
    ];

    // Relations

    public function depreciationEntries(): HasMany
    {
        return $this->hasMany(DepreciationEntry::class);
    }

    public function assetAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'asset_account_id');
    }

    public function depreciationAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'depreciation_account_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Computed attributes

    public function getNetBookValueAttribute(): float
    {
        return $this->purchase_cost - $this->accumulated_depreciation;
    }

    public function getAnnualDepreciationAttribute(): float
    {
        return ($this->purchase_cost - $this->salvage_value) / $this->useful_life_years;
    }

    public function getDepreciableAmountAttribute(): float
    {
        return $this->purchase_cost - $this->salvage_value;
    }

    // Business logic

    public function runDepreciation(string $periodDate, string $method = 'straight_line'): DepreciationEntry
    {
        if ($this->status !== 'active') {
            throw new DomainException('Cannot depreciate asset with status: ' . $this->status);
        }

        $annualDepreciation = $this->annual_depreciation;
        $remaining          = $this->depreciable_amount - $this->accumulated_depreciation;

        if ($remaining <= 0) {
            throw new DomainException('Asset is fully depreciated');
        }

        $periodAmount = min($annualDepreciation, $remaining);

        return DB::transaction(function () use ($periodDate, $periodAmount) {
            $journalEntryId = null;

            if ($this->depreciation_account_id && $this->asset_account_id) {
                $journalEntry = JournalEntry::create([
                    'tenant_id'   => $this->tenant_id,
                    'date'        => $periodDate,
                    'reference'   => 'DEP-' . $this->code,
                    'description' => 'Depreciation for ' . $this->name,
                    'status'      => 'posted',
                    'created_by'  => $this->created_by,
                ]);

                // Debit depreciation expense account
                $journalEntry->lines()->create([
                    'account_id'  => $this->depreciation_account_id,
                    'debit'       => $periodAmount,
                    'credit'      => 0,
                    'description' => 'Depreciation expense: ' . $this->name,
                ]);

                // Credit asset account
                $journalEntry->lines()->create([
                    'account_id'  => $this->asset_account_id,
                    'debit'       => 0,
                    'credit'      => $periodAmount,
                    'description' => 'Accumulated depreciation: ' . $this->name,
                ]);

                $journalEntryId = $journalEntry->id;
            }

            $entry = DepreciationEntry::create([
                'tenant_id'       => $this->tenant_id,
                'fixed_asset_id'  => $this->id,
                'journal_entry_id' => $journalEntryId,
                'period_date'     => $periodDate,
                'amount'          => $periodAmount,
            ]);

            $this->accumulated_depreciation += $periodAmount;

            if ($this->accumulated_depreciation >= $this->depreciable_amount) {
                $this->status = 'fully_depreciated';
            }

            $this->save();

            return $entry;
        });
    }
}
