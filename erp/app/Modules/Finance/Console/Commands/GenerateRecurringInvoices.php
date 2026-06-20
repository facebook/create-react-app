<?php

namespace App\Modules\Finance\Console\Commands;

use App\Modules\Finance\Models\RecurringInvoice;
use Illuminate\Console\Command;

class GenerateRecurringInvoices extends Command
{
    protected $signature = 'invoices:generate-recurring';

    protected $description = 'Generate invoices from due recurring invoice templates';

    public function handle(): int
    {
        $count = 0;

        foreach (RecurringInvoice::due()->with('items')->get() as $recurringInvoice) {
            $recurringInvoice->generateInvoice();
            $count++;
        }

        $this->info("Generated {$count} invoice(s).");

        return self::SUCCESS;
    }
}
