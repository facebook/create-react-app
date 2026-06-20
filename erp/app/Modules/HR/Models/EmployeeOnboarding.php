<?php

namespace App\Modules\HR\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EmployeeOnboarding extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id', 'employee_id', 'template_id', 'onboarding_checklist_id',
        'title', 'status', 'started_at', 'start_date', 'completed_at', 'assigned_by',
    ];

    protected $casts = [
        'started_at'   => 'date',
        'start_date'   => 'date',
        'completed_at' => 'datetime',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(OnboardingTemplate::class, 'template_id');
    }

    public function checklist(): BelongsTo
    {
        return $this->belongsTo(OnboardingChecklist::class, 'onboarding_checklist_id');
    }

    /** Legacy tasks (EmployeeOnboardingTask) */
    public function tasks(): HasMany
    {
        return $this->hasMany(EmployeeOnboardingTask::class)->orderBy('sort_order');
    }

    /** New progress items (OnboardingProgress) */
    public function progress(): HasMany
    {
        return $this->hasMany(OnboardingProgress::class, 'employee_onboarding_id');
    }

    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    /** Legacy progress percentage (0-100 integer) */
    public function getProgressAttribute(): int
    {
        $total = $this->tasks()->count();
        if ($total === 0) return 0;
        return (int) round($this->tasks()->whereNotNull('completed_at')->count() / $total * 100);
    }

    /** New completion percentage (0.0-100.0 float) */
    public function getCompletionPercentAttribute(): float
    {
        $total = $this->progress()->count();
        if ($total === 0) return 0.0;
        $done = $this->progress()->whereIn('status', ['completed', 'skipped'])->count();
        return round($done / $total * 100, 1);
    }

    /**
     * Auto-complete this onboarding if all required tasks are completed or skipped.
     */
    public function checkComplete(): void
    {
        $requiredTotal = $this->progress()
            ->whereHas('task', fn($q) => $q->where('is_required', true))
            ->count();

        if ($requiredTotal === 0) {
            return;
        }

        $requiredDone = $this->progress()
            ->whereHas('task', fn($q) => $q->where('is_required', true))
            ->whereIn('status', ['completed', 'skipped'])
            ->count();

        if ($requiredDone >= $requiredTotal) {
            $this->update([
                'status'       => 'completed',
                'completed_at' => now(),
            ]);
        }
    }

    /**
     * Instantiate from a template, creating task copies for the employee.
     */
    public static function fromTemplate(Employee $employee, OnboardingTemplate $template): self
    {
        $startDate = $employee->start_date ?? now()->toDateString();

        $onboarding = self::create([
            'tenant_id'   => $employee->tenant_id,
            'employee_id' => $employee->id,
            'template_id' => $template->id,
            'title'       => $template->name,
            'status'      => 'in_progress',
            'started_at'  => $startDate,
        ]);

        foreach ($template->tasks as $task) {
            $dueDate = $task->due_days > 0
                ? \Carbon\Carbon::parse($onboarding->started_at)->addDays($task->due_days)->toDateString()
                : null;

            $onboarding->tasks()->create([
                'title'       => $task->title,
                'description' => $task->description,
                'due_date'    => $dueDate,
                'sort_order'  => $task->sort_order,
            ]);
        }

        return $onboarding;
    }
}
