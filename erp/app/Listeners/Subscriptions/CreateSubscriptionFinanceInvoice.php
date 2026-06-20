<?php

namespace App\Listeners\Subscriptions;

use App\Events\Subscriptions\SubscriptionRenewed;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\InvoiceItem;

class CreateSubscriptionFinanceInvoice
{
    public function handle(SubscriptionRenewed $event): void
    {
        $subscription = $event->subscription;
        $plan         = $subscription->plan;

        $invoice = Invoice::create([
            'tenant_id'  => $subscription->tenant_id,
            'number'     => 'INV-SUB-' . $subscription->id . '-' . now()->format('Ymd') . '-' . uniqid(),
            'issue_date' => now()->toDateString(),
            'due_date'   => now()->addDays(30)->toDateString(),
            'status'     => 'draft',
            'notes'      => 'Auto-created from subscription renewal',
        ]);

        InvoiceItem::create([
            'invoice_id'  => $invoice->id,
            'description' => ($plan->name ?? 'Subscription') . ' - ' . $subscription->current_period_start . ' to ' . $subscription->current_period_end,
            'quantity'    => 1,
            'unit_price'  => $plan->price ?? 0,
            'tax_rate'    => 0,
        ]);
    }
}
