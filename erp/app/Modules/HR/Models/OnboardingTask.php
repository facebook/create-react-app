<?php

namespace App\Modules\HR\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OnboardingTask extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'onboarding_checklist_id',
        'title',
        'description',
        'category',
        'due_day_offset',
        'is_required',
        'sort_order',
    ];

    protected $casts = [
        'is_required'    => 'boolean',
        'due_day_offset' => 'integer',
        'sort_order'     => 'integer',
    ];

    public function checklist(): BelongsTo
    {
        return $this->belongsTo(OnboardingChecklist::class, 'onboarding_checklist_id');
    }
}
