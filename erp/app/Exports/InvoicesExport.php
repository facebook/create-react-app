<?php

namespace App\Exports;

use App\Modules\Finance\Models\Invoice;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class InvoicesExport implements FromQuery, WithHeadings, WithMapping
{
    public function __construct(private readonly int $tenantId) {}

    public function query()
    {
        return Invoice::where('tenant_id', $this->tenantId)->with('items');
    }

    public function headings(): array
    {
        return ['ID', 'Number', 'Status', 'Issue Date', 'Total'];
    }

    public function map($invoice): array
    {
        return [
            $invoice->id,
            $invoice->number,
            $invoice->status,
            $invoice->issue_date?->toDateString(),
            $invoice->total,
        ];
    }
}
