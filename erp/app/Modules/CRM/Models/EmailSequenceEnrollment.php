<?php

namespace App\Modules\CRM\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmailSequenceEnrollment extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'sequence_id',
        'lead_id',
        'current_step',
        'status',
        'next_send_at',
    ];

    protected $casts = [
        'current_step' => 'integer',
        'next_send_at' => 'datetime',
    ];

    public function sequence(): BelongsTo
    {
        return $this->belongsTo(EmailSequence::class, 'sequence_id');
    }

    public function lead(): BelongsTo
    {
        return $this->belongsTo(CrmLead::class, 'lead_id');
    }

    public function unsubscribe(): void
    {
        $this->update(['status' => 'unsubscribed']);
    }

    public function advance(): void
    {
        $nextStep = $this->current_step + 1;
        $totalSteps = $this->sequence->total_steps;

        if ($nextStep >= $totalSteps) {
            $this->update(['status' => 'completed', 'current_step' => $nextStep]);
            return;
        }

        $step = $this->sequence->steps()->where('step_number', $nextStep)->first();
        $delay = $step ? $step->delay_days : 1;

        $this->update([
            'current_step' => $nextStep,
            'next_send_at' => now()->addDays($delay),
        ]);
    }
}
