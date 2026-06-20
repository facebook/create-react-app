<?php

namespace App\Modules\CRM\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EmailSequence extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'name',
        'description',
        'status',
        'total_steps',
    ];

    public function steps(): HasMany
    {
        return $this->hasMany(EmailSequenceStep::class, 'sequence_id')->orderBy('step_number');
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(EmailSequenceEnrollment::class, 'sequence_id');
    }

    public function pause(): void
    {
        $this->update(['status' => 'paused']);
    }

    public function activate(): void
    {
        $this->update(['status' => 'active']);
    }

    public function archive(): void
    {
        $this->update(['status' => 'archived']);
    }

    public function enrollLead(CrmLead $lead): EmailSequenceEnrollment
    {
        return $this->enrollments()->firstOrCreate(
            ['lead_id' => $lead->id],
            [
                'tenant_id'    => $this->tenant_id,
                'current_step' => 0,
                'status'       => 'active',
                'next_send_at' => now(),
            ]
        );
    }
}
