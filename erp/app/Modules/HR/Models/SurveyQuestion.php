<?php

namespace App\Modules\HR\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SurveyQuestion extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'employee_survey_id', 'question_text',
        'question_type', 'options', 'sort_order', 'is_required',
    ];

    protected $casts = [
        'options'     => 'array',
        'is_required' => 'boolean',
    ];

    public function survey(): BelongsTo
    {
        return $this->belongsTo(EmployeeSurvey::class, 'employee_survey_id');
    }
}
