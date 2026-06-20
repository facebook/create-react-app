<?php

namespace App\Jobs;

use App\Modules\CRM\Models\EmailSequenceEnrollment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendEmailSequenceStep implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;

    public function __construct(
        public int $enrollmentId,
        public int $stepId,
    ) {
        $this->queue = 'email';
    }

    public function handle(): void
    {
        $enrollment = EmailSequenceEnrollment::with(['lead', 'sequence'])->find($this->enrollmentId);

        if (! $enrollment) {
            Log::warning('SendEmailSequenceStep: Enrollment not found', [
                'enrollment_id' => $this->enrollmentId,
                'step_id'       => $this->stepId,
            ]);
            return;
        }

        $enrollment->advance();

        Log::info('SendEmailSequenceStep: Advanced enrollment', [
            'enrollment_id' => $this->enrollmentId,
            'step_id'       => $this->stepId,
            'lead_id'       => $enrollment->lead_id,
            'current_step'  => $enrollment->current_step,
        ]);
    }
}
