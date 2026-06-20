<?php

namespace App\Modules\HR\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OnboardingTemplate extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = ['tenant_id', 'name', 'description', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function tasks(): HasMany
    {
        return $this->hasMany(OnboardingTemplateTask::class)->orderBy('sort_order');
    }

    public function onboardings(): HasMany
    {
        return $this->hasMany(EmployeeOnboarding::class, 'template_id');
    }
}
