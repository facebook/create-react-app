<?php

namespace App\Modules\HR\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PerformanceKpi extends Model
{
    use BelongsToTenant;

    protected $table = 'performance_kpis';

    protected $fillable = [
        'tenant_id',
        'performance_review_id',
        'name',
        'description',
        'target_score',
        'actual_score',
        'weight',
        'notes',
    ];

    protected $casts = [
        'target_score' => 'decimal:2',
        'actual_score' => 'decimal:2',
        'weight'       => 'decimal:2',
    ];

    public function review(): BelongsTo
    {
        return $this->belongsTo(PerformanceReview::class, 'performance_review_id');
    }

    public function getAchievementPercentAttribute(): ?float
    {
        if ($this->target_score <= 0) {
            return null;
        }

        return round($this->actual_score / $this->target_score * 100, 1);
    }
}
