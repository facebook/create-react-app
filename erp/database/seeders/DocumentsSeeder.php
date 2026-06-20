<?php

namespace Database\Seeders;

use App\Modules\Core\Models\Tenant;
use App\Modules\Documents\Models\Document;
use Illuminate\Database\Seeder;

class DocumentsSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();

        if (! $tenant) {
            return;
        }

        Document::create([
            'tenant_id'  => $tenant->id,
            'title'      => 'Employee Handbook 2026',
            'description' => 'Company policies, procedures, and employee guidelines',
            'file_path'  => 'documents/employee-handbook-2026.pdf',
            'file_name'  => 'employee-handbook-2026.pdf',
            'file_size'  => 2048000,
            'mime_type'  => 'application/pdf',
            'version'    => 1,
            'tags'       => ['hr', 'policy', 'onboarding'],
        ]);

        Document::create([
            'tenant_id'  => $tenant->id,
            'title'      => 'Q1 2026 Financial Report',
            'description' => 'Quarterly financial statements and analysis for Q1 2026',
            'file_path'  => 'documents/q1-2026-financial-report.xlsx',
            'file_name'  => 'q1-2026-financial-report.xlsx',
            'file_size'  => 512000,
            'mime_type'  => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'version'    => 2,
            'tags'       => ['finance', 'report', 'q1-2026'],
        ]);

        Document::create([
            'tenant_id'  => $tenant->id,
            'title'      => 'Sales Contract Template',
            'description' => 'Standard sales agreement template for new clients',
            'file_path'  => 'documents/sales-contract-template.docx',
            'file_name'  => 'sales-contract-template.docx',
            'file_size'  => 128000,
            'mime_type'  => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'version'    => 1,
            'tags'       => ['legal', 'sales', 'template'],
        ]);
    }
}
