<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SupplierScorecard extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'supplier_name',
        'supplier_code',
        'scorecard_number',
        'period',
        'quality_score',
        'delivery_score',
        'pricing_score',
        'service_score',
        'overall_score',
        'rating',
        'status',
        'notes',
        'evaluated_by',
        'published_at',
    ];

    protected $attributes = [
        'status'         => 'draft',
        'rating'         => 'pending',
        'quality_score'  => 0,
        'delivery_score' => 0,
        'pricing_score'  => 0,
        'service_score'  => 0,
        'overall_score'  => 0,
    ];

    protected $casts = [
        'quality_score'  => 'decimal:2',
        'delivery_score' => 'decimal:2',
        'pricing_score'  => 'decimal:2',
        'service_score'  => 'decimal:2',
        'overall_score'  => 'decimal:2',
        'published_at'   => 'datetime',
    ];

    public function calculateOverallScore(): void
    {
        $avg = ((float) $this->quality_score
            + (float) $this->delivery_score
            + (float) $this->pricing_score
            + (float) $this->service_score) / 4.0;

        $this->overall_score = round($avg, 2);

        if ($avg < 40) {
            $this->rating = 'poor';
        } elseif ($avg < 60) {
            $this->rating = 'fair';
        } elseif ($avg < 80) {
            $this->rating = 'good';
        } else {
            $this->rating = 'excellent';
        }

        $this->save();
    }

    public function publish(int $userId): void
    {
        $this->calculateOverallScore();

        if ($this->scorecard_number === null) {
            $this->scorecard_number = $this->generateScorecardNumber();
        }

        $this->status       = 'published';
        $this->evaluated_by = $userId;
        $this->published_at = now();

        $this->save();
    }

    public function generateScorecardNumber(): string
    {
        return 'SC-' . date('Y') . '-' . str_pad((string) $this->id, 5, '0', STR_PAD_LEFT);
    }

    public function getIsPublishedAttribute(): bool
    {
        return $this->status === 'published';
    }

    public function getIsDraftAttribute(): bool
    {
        return $this->status === 'draft';
    }
}
