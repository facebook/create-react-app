<?php

namespace App\Modules\HR\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SuccessionCandidate extends Model
{
    protected $fillable = [
        'succession_plan_id',
        'employee_id',
        'readiness_level',
        'priority',
        'readiness_score',
        'development_notes',
    ];

    protected $casts = [
        'readiness_score' => 'integer',
        'priority'        => 'integer',
    ];

    protected $attributes = [
        'readiness_level' => 'not-ready',
        'priority'        => 1,
        'readiness_score' => 0,
    ];

    public function plan(): BelongsTo
    {
        return $this->belongsTo(SuccessionPlan::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
