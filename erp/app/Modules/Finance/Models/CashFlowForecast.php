<?php

namespace App\Modules\Finance\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CashFlowForecast extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'forecast_number',
        'name',
        'period_type',
        'period_start',
        'period_end',
        'opening_balance',
        'projected_inflows',
        'projected_outflows',
        'actual_inflows',
        'actual_outflows',
        'status',
        'notes',
        'created_by',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'opening_balance'    => 'decimal:2',
        'projected_inflows'  => 'decimal:2',
        'projected_outflows' => 'decimal:2',
        'actual_inflows'     => 'decimal:2',
        'actual_outflows'    => 'decimal:2',
        'period_start'       => 'date',
        'period_end'         => 'date',
        'approved_at'        => 'datetime',
    ];

    protected $attributes = [
        'status'             => 'draft',
        'opening_balance'    => 0,
        'projected_inflows'  => 0,
        'projected_outflows' => 0,
        'actual_inflows'     => 0,
        'actual_outflows'    => 0,
    ];

    // ─── Actions ──────────────────────────────────────────────────────────────

    public function publish(int $userId): void
    {
        $this->status      = 'published';
        $this->approved_by = $userId;
        $this->approved_at = now();

        if (is_null($this->forecast_number)) {
            $this->forecast_number = $this->generateForecastNumber();
        }

        $this->save();
    }

    public function archive(): void
    {
        $this->status = 'archived';
        $this->save();
    }

    public function generateForecastNumber(): string
    {
        return 'CF-' . date('Y') . '-' . str_pad((string) $this->id, 5, '0', STR_PAD_LEFT);
    }

    // ─── Accessors ────────────────────────────────────────────────────────────

    public function getProjectedNetAttribute(): float
    {
        return (float) $this->projected_inflows - (float) $this->projected_outflows;
    }

    public function getActualNetAttribute(): float
    {
        return (float) $this->actual_inflows - (float) $this->actual_outflows;
    }

    public function getProjectedClosingBalanceAttribute(): float
    {
        return (float) $this->opening_balance + $this->projected_net;
    }

    public function getActualClosingBalanceAttribute(): float
    {
        return (float) $this->opening_balance + $this->actual_net;
    }

    public function getVarianceAttribute(): float
    {
        return $this->actual_net - $this->projected_net;
    }

    public function getIsDraftAttribute(): bool
    {
        return $this->status === 'draft';
    }

    public function getIsPublishedAttribute(): bool
    {
        return $this->status === 'published';
    }
}
