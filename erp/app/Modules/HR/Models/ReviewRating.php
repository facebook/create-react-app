<?php

namespace App\Modules\HR\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReviewRating extends Model
{
    use BelongsToTenant;

    protected $table = 'review_ratings';

    protected $fillable = [
        'tenant_id',
        'performance_review_id',
        'competency',
        'rating',
        'notes',
    ];

    protected $casts = [
        'rating' => 'integer',
    ];

    public function review(): BelongsTo
    {
        return $this->belongsTo(PerformanceReview::class, 'performance_review_id');
    }
}
