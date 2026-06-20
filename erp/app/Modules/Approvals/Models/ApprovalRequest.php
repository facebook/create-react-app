<?php

namespace App\Modules\Approvals\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ApprovalRequest extends Model
{
    use BelongsToTenant;

    protected $table = 'approval_requests';

    protected $fillable = [
        'tenant_id',
        'workflow_id',
        'entity_type',
        'entity_id',
        'entity_title',
        'status',
        'current_step',
        'total_steps',
        'requested_by',
        'approved_at',
        'rejected_at',
        'rejection_reason',
    ];

    protected $casts = [
        'approved_at'   => 'datetime',
        'rejected_at'   => 'datetime',
        'current_step'  => 'integer',
        'total_steps'   => 'integer',
    ];

    public function workflow(): BelongsTo
    {
        return $this->belongsTo(ApprovalWorkflow::class, 'workflow_id');
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function actions(): HasMany
    {
        return $this->hasMany(ApprovalAction::class, 'request_id')->orderBy('step_number');
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function currentStepObject(): ?ApprovalStep
    {
        if (! $this->workflow) {
            return null;
        }

        return $this->workflow->steps->where('step_number', $this->current_step)->first();
    }

    public function canApprove(User $user): bool
    {
        if (! $this->isPending()) {
            return false;
        }

        $step = $this->currentStepObject();

        if (! $step) {
            return false;
        }

        if ($step->approver_id && $step->approver_id === $user->id) {
            return true;
        }

        if ($step->approver_role && $user->hasRole($step->approver_role)) {
            return true;
        }

        return false;
    }

    public function approve(User $user, string $comments = ''): void
    {
        $this->actions()->create([
            'step_number' => $this->current_step,
            'action'      => 'approved',
            'actor_id'    => $user->id,
            'comments'    => $comments ?: null,
            'acted_at'    => now(),
        ]);

        if ($this->current_step < $this->total_steps) {
            $this->current_step += 1;
            $this->save();
        } else {
            $this->status      = 'approved';
            $this->approved_at = now();
            $this->save();
        }
    }

    public function reject(User $user, string $reason = ''): void
    {
        $this->actions()->create([
            'step_number' => $this->current_step,
            'action'      => 'rejected',
            'actor_id'    => $user->id,
            'comments'    => $reason ?: null,
            'acted_at'    => now(),
        ]);

        $this->status           = 'rejected';
        $this->rejected_at      = now();
        $this->rejection_reason = $reason ?: null;
        $this->save();
    }

    public function cancel(): void
    {
        $this->status = 'cancelled';
        $this->save();
    }

    public static function createFor(
        string $entityType,
        int $entityId,
        string $entityTitle,
        int $requestedBy,
        int $tenantId,
        float $amount = 0
    ): ?self {
        $workflow = ApprovalWorkflow::findFor($entityType, $amount, $tenantId);

        if (! $workflow) {
            return null;
        }

        return self::create([
            'tenant_id'    => $tenantId,
            'workflow_id'  => $workflow->id,
            'entity_type'  => $entityType,
            'entity_id'    => $entityId,
            'entity_title' => $entityTitle,
            'status'       => 'pending',
            'current_step' => 1,
            'total_steps'  => $workflow->stepCount(),
            'requested_by' => $requestedBy,
        ]);
    }
}
