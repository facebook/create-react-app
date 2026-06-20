<?php

namespace App\Services;

use App\Models\AlertEvent;
use App\Models\AlertRule;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Inventory\Models\Product;
use App\Modules\HelpDesk\Models\Ticket;
use Illuminate\Support\Facades\DB;

class AlertEvaluatorService
{
    public function evaluate(AlertRule $rule): array
    {
        return match ($rule->type) {
            'overdue_invoice'   => $this->checkOverdueInvoices($rule),
            'low_stock'         => $this->checkLowStock($rule),
            'high_receivables'  => $this->checkHighReceivables($rule),
            'unresolved_ticket' => $this->checkUnresolvedTickets($rule),
            default             => [],
        };
    }

    private function checkOverdueInvoices(AlertRule $rule): array
    {
        $days      = $rule->conditions['days'] ?? 30;
        $threshold = now()->subDays($days);

        $invoices = Invoice::withoutGlobalScopes()
            ->where('tenant_id', $rule->tenant_id)
            ->where('status', 'sent')
            ->where('due_date', '<', $threshold)
            ->get(['id', 'number', 'total', 'due_date', 'contact_id']);

        if ($invoices->isEmpty()) {
            return [];
        }

        return [[
            'message' => "{$invoices->count()} invoice(s) overdue by more than {$days} days",
            'context' => [
                'count'    => $invoices->count(),
                'ids'      => $invoices->pluck('id')->toArray(),
                'numbers'  => $invoices->pluck('number')->toArray(),
                'total_outstanding' => $invoices->sum('total'),
            ],
        ]];
    }

    private function checkLowStock(AlertRule $rule): array
    {
        $threshold = $rule->conditions['below'] ?? 10;

        $products = Product::withoutGlobalScopes()
            ->where('tenant_id', $rule->tenant_id)
            ->where('stock_quantity', '<', $threshold)
            ->where('reorder_point', '>', 0)
            ->get(['id', 'name', 'sku', 'stock_quantity']);

        if ($products->isEmpty()) {
            return [];
        }

        return [[
            'message' => "{$products->count()} product(s) with stock below {$threshold}",
            'context' => [
                'count'    => $products->count(),
                'products' => $products->map(fn ($p) => [
                    'id'       => $p->id,
                    'name'     => $p->name,
                    'sku'      => $p->sku,
                    'quantity' => $p->stock_quantity,
                ])->toArray(),
            ],
        ]];
    }

    private function checkHighReceivables(AlertRule $rule): array
    {
        $threshold = $rule->conditions['amount'] ?? 10000;

        $total = Invoice::withoutGlobalScopes()
            ->where('tenant_id', $rule->tenant_id)
            ->whereNotIn('status', ['paid', 'cancelled'])
            ->sum('total');

        if ($total < $threshold) {
            return [];
        }

        return [[
            'message' => "Outstanding receivables (\${$total}) exceed threshold of \${$threshold}",
            'context' => ['total_outstanding' => $total, 'threshold' => $threshold],
        ]];
    }

    private function checkUnresolvedTickets(AlertRule $rule): array
    {
        $hours   = $rule->conditions['hours'] ?? 48;
        $cutoff  = now()->subHours($hours);

        try {
            $count = Ticket::withoutGlobalScopes()
                ->where('tenant_id', $rule->tenant_id)
                ->whereNotIn('status', ['resolved', 'closed'])
                ->where('created_at', '<', $cutoff)
                ->count();

            if ($count === 0) {
                return [];
            }

            return [[
                'message' => "{$count} helpdesk ticket(s) unresolved for more than {$hours} hours",
                'context' => ['count' => $count, 'hours' => $hours],
            ]];
        } catch (\Throwable) {
            return [];
        }
    }

    public function fire(AlertRule $rule, array $triggered): void
    {
        foreach ($triggered as $alert) {
            AlertEvent::create([
                'alert_rule_id' => $rule->id,
                'message'       => $alert['message'],
                'context'       => $alert['context'] ?? null,
                'triggered_at'  => now(),
            ]);
        }

        $rule->update(['last_triggered_at' => now()]);

        // Send in-app notifications
        foreach ($rule->notification_targets as $target) {
            if (is_int($target)) {
                NotificationService::send(
                    $rule->tenant_id,
                    $target,
                    'alert',
                    "Alert: {$rule->name}",
                    $triggered[0]['message'] ?? '',
                    ['rule_id' => $rule->id]
                );
            }
        }
    }
}
