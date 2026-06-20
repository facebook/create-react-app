<?php

namespace App\Modules\HR\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class EmployeeSurvey extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $attributes = [
        'status'       => 'draft',
        'is_anonymous' => false,
    ];

    protected $fillable = [
        'tenant_id', 'title', 'description', 'status',
        'start_date', 'end_date', 'is_anonymous', 'created_by',
    ];

    protected $casts = [
        'start_date'   => 'date',
        'end_date'     => 'date',
        'is_anonymous' => 'boolean',
    ];

    public function publish(): void
    {
        $this->update(['status' => 'published']);
    }

    public function close(): void
    {
        $this->update(['status' => 'closed']);
    }

    public function getIsActiveAttribute(): bool
    {
        return $this->status === 'published'
            && ($this->end_date === null || $this->end_date->gte(now()->startOfDay()));
    }

    public function getResponseCountAttribute(): int
    {
        return $this->responses()->count();
    }

    public function questions(): HasMany
    {
        return $this->hasMany(SurveyQuestion::class, 'employee_survey_id');
    }

    public function responses(): HasMany
    {
        return $this->hasMany(SurveyResponse::class, 'employee_survey_id');
    }
}
