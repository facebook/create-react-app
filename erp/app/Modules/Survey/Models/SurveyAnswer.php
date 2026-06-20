<?php

namespace App\Modules\Survey\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SurveyAnswer extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'survey_response_id',
        'survey_question_id',
        'tenant_id',
        'answer_text',
        'answer_options',
    ];

    protected $casts = [
        'answer_options' => 'array',
    ];

    public function response(): BelongsTo
    {
        return $this->belongsTo(SurveyResponse::class, 'survey_response_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(SurveyQuestion::class, 'survey_question_id');
    }
}
