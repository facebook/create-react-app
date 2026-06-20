<?php

namespace App\Modules\HR\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PerformanceReviewGoal extends Model
{
    protected $fillable = ['performance_review_id', 'title', 'description', 'achieved', 'achievement_notes'];

    protected $casts = ['achieved' => 'boolean'];

    public function review(): BelongsTo
    {
        return $this->belongsTo(PerformanceReview::class, 'performance_review_id');
    }
}
