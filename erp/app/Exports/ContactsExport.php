<?php

namespace App\Exports;

use App\Modules\Finance\Models\Contact;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ContactsExport implements FromQuery, WithHeadings, WithMapping
{
    public function __construct(private readonly int $tenantId) {}

    public function query()
    {
        return Contact::where('tenant_id', $this->tenantId);
    }

    public function headings(): array
    {
        return ['ID', 'Name', 'Email', 'Type'];
    }

    public function map($contact): array
    {
        return [
            $contact->id,
            $contact->name,
            $contact->email,
            $contact->type,
        ];
    }
}
