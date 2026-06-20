<?php

namespace App\Imports;

use App\Modules\Finance\Models\Contact;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\SkipsErrors;

class ContactsImport implements ToModel, WithHeadingRow, SkipsOnError
{
    use SkipsErrors;

    public function __construct(private readonly int $tenantId) {}

    public function model(array $row): ?Contact
    {
        return new Contact([
            'tenant_id' => $this->tenantId,
            'name'      => $row['name'] ?? null,
            'email'     => $row['email'] ?? null,
            'type'      => $row['type'] ?? 'customer',
        ]);
    }
}
