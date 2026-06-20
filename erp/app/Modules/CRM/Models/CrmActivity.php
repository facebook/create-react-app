<?php

namespace App\Modules\CRM\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrmActivity extends Model
{
    use BelongsToTenant;

    protected $table = 'crm_activities';

    protected $fillable = [
        'tenant_id', 'lead_id', 'type', 'subject', 'description',
        'scheduled_at', 'completed_at', 'is_done', 'assigned_to', 'created_by',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'completed_at' => 'datetime',
        'is_done'      => 'boolean',
    ];

    protected $attributes = ['is_done' => false];

    public function lead(): BelongsTo
    {
        return $this->belongsTo(CrmLead::class, 'lead_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function markDone(): void
    {
        $this->is_done      = true;
        $this->completed_at = now();
        $this->save();
    }
}
