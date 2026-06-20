<?php

namespace App\Modules\Finance\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DepreciationEntry extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'fixed_asset_id',
        'journal_entry_id',
        'period_date',
        'amount',
    ];

    protected $casts = [
        'period_date' => 'date',
        'amount'      => 'float',
    ];

    public function fixedAsset(): BelongsTo
    {
        return $this->belongsTo(FixedAsset::class);
    }

    public function journalEntry(): BelongsTo
    {
        return $this->belongsTo(JournalEntry::class);
    }
}
