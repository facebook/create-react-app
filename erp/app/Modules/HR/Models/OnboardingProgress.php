<?php

namespace App\Modules\HR\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OnboardingProgress extends Model
{
    use BelongsToTenant;

    protected $table = 'onboarding_progress';

    protected $fillable = [
        'tenant_id',
        'employee_onboarding_id',
        'onboarding_task_id',
        'status',
        'notes',
        'completed_by',
        'completed_at',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
    ];

    public function onboarding(): BelongsTo
    {
        return $this->belongsTo(EmployeeOnboarding::class, 'employee_onboarding_id');
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(OnboardingTask::class, 'onboarding_task_id');
    }

    public function completedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'completed_by');
    }

    public function complete(User $user, ?string $notes = null): void
    {
        $this->status       = 'completed';
        $this->completed_by = $user->id;
        $this->completed_at = now();
        $this->notes        = $notes;
        $this->save();

        $this->onboarding->checkComplete();
    }

    public function skip(?string $notes = null): void
    {
        $this->status = 'skipped';
        $this->notes  = $notes;
        $this->save();

        $this->onboarding->checkComplete();
    }
}
