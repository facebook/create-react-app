<?php

namespace App\Modules\HR\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SurveyResponse extends Model
{
    use BelongsToTenant;

    protected $table = 'employee_survey_responses';

    protected $fillable = [
        'tenant_id', 'employee_survey_id', 'employee_id', 'answers', 'submitted_at',
    ];

    protected $casts = [
        'answers'      => 'array',
        'submitted_at' => 'datetime',
    ];

    public function survey(): BelongsTo
    {
        return $this->belongsTo(EmployeeSurvey::class, 'employee_survey_id');
    }
}
