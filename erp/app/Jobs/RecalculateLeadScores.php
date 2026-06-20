<?php

namespace App\Jobs;

use App\Modules\CRM\Models\CrmLead;
use App\Modules\CRM\Models\LeadScoringRule;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class RecalculateLeadScores implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public int $tenantId,
    ) {
        $this->queue = 'default';
    }

    public function handle(): void
    {
        $leads = CrmLead::where('tenant_id', $this->tenantId)->get();

        foreach ($leads as $lead) {
            try {
                $score = LeadScoringRule::scoreForLead($lead);

                if (in_array('score', $lead->getFillable(), true)) {
                    $lead->update(['score' => $score]);
                }
            } catch (\Throwable $e) {
                Log::warning('RecalculateLeadScores: Failed to score lead', [
                    'lead_id'   => $lead->id,
                    'tenant_id' => $this->tenantId,
                    'error'     => $e->getMessage(),
                ]);
            }
        }
    }
}
