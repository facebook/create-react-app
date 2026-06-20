<?php

namespace App\Listeners\CRM;

use App\Events\CRM\CrmDealWon;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\InvoiceItem;

class CreateFinanceInvoiceFromDeal
{
    public function handle(CrmDealWon $event): void
    {
        $lead = $event->lead;

        $invoice = Invoice::create([
            'tenant_id'  => $lead->tenant_id,
            'number'     => 'INV-CRM-' . $lead->id . '-' . uniqid(),
            'issue_date' => now()->toDateString(),
            'due_date'   => now()->addDays(30)->toDateString(),
            'status'     => 'draft',
            'notes'      => 'Auto-created from CRM deal: ' . $lead->title,
        ]);

        InvoiceItem::create([
            'invoice_id'  => $invoice->id,
            'description' => $lead->title,
            'quantity'    => 1,
            'unit_price'  => $lead->expected_revenue ?? 0,
            'tax_rate'    => 0,
        ]);
    }
}
