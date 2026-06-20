<?php

namespace App\Console\Commands;

use App\Models\AlertRule;
use App\Services\AlertEvaluatorService;
use Illuminate\Console\Command;

class EvaluateAlerts extends Command
{
    protected $signature   = 'alerts:evaluate';
    protected $description = 'Evaluate all active alert rules and fire notifications for triggered ones';

    public function handle(AlertEvaluatorService $evaluator): int
    {
        $rules   = AlertRule::where('is_active', true)->get();
        $fired   = 0;
        $checked = 0;

        foreach ($rules as $rule) {
            $triggered = $evaluator->evaluate($rule);
            $checked++;

            if (! empty($triggered)) {
                $evaluator->fire($rule, $triggered);
                $fired++;
                $this->info("Triggered: {$rule->name} — {$triggered[0]['message']}");
            }
        }

        $this->info("Checked {$checked} rule(s), triggered {$fired}.");

        return self::SUCCESS;
    }
}
