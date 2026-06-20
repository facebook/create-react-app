<?php

namespace App\Modules\HR\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\User;

class PerformanceReview extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $table = 'performance_reviews';

    protected $fillable = [
        'tenant_id',
        'employee_id',
        'reviewer_id',
        'period',
        'review_period',
        'review_date',
        'status',
        'overall_rating',
        'strengths',
        'improvements',
        'goals',
        'reviewer_notes',
        'employee_comments',
        'submitted_at',
        'acknowledged_at',
    ];

    protected $casts = [
        'review_date'      => 'date',
        'submitted_at'     => 'datetime',
        'acknowledged_at'  => 'datetime',
        'overall_rating'   => 'integer',
        'status'           => 'string',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function kpis(): HasMany
    {
        return $this->hasMany(PerformanceKpi::class);
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(ReviewRating::class);
    }

    public function submit(): void
    {
        $this->status       = 'submitted';
        $this->submitted_at = now();
        $this->save();
    }

    public function acknowledge(string $comments = ''): void
    {
        $this->status          = 'acknowledged';
        $this->acknowledged_at = now();
        if ($comments !== '') {
            $this->employee_comments = $comments;
        }
        $this->save();
    }

    public function getIsCompleteAttribute(): bool
    {
        return $this->status === 'acknowledged';
    }

    public function getAverageRatingAttribute(): float
    {
        if ($this->ratings()->count() > 0) {
            return round((float) $this->ratings()->avg('rating'), 1);
        }
        return (float) ($this->overall_rating ?? 0);
    }

    public function getAverageKpiScoreAttribute(): ?float
    {
        $kpis = $this->kpis->filter(fn ($kpi) => $kpi->target_score > 0);

        if ($kpis->isEmpty()) {
            return null;
        }

        $total = $kpis->sum(fn ($kpi) => ($kpi->actual_score / $kpi->target_score) * 100);

        return round($total / $kpis->count(), 1);
    }
}
