<?php

namespace App\Console\Commands;

use App\Jobs\SendScheduledReportJob;
use App\Models\ReportSchedule;
use Illuminate\Console\Command;

class SendScheduledReports extends Command
{
    protected $signature   = 'reports:send-scheduled';
    protected $description = 'Dispatch queued jobs for all due report schedules';

    public function handle(): int
    {
        $due = ReportSchedule::where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('next_run_at')
                  ->orWhere('next_run_at', '<=', now());
            })
            ->get();

        foreach ($due as $schedule) {
            SendScheduledReportJob::dispatch($schedule);
            $this->info("Queued report: {$schedule->name} ({$schedule->report_type})");
        }

        $this->info("Dispatched {$due->count()} scheduled report job(s).");

        return self::SUCCESS;
    }
}
