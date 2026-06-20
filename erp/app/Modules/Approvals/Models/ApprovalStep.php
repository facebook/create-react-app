<?php

namespace App\Modules\Approvals\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApprovalStep extends Model
{
    protected $table = 'approval_steps';

    protected $fillable = [
        'workflow_id',
        'step_number',
        'name',
        'approver_id',
        'approver_role',
        'is_required',
    ];

    protected $casts = [
        'is_required' => 'boolean',
    ];

    public function workflow(): BelongsTo
    {
        return $this->belongsTo(ApprovalWorkflow::class, 'workflow_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approver_id');
    }
}
