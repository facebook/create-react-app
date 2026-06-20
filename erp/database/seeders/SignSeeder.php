<?php

namespace Database\Seeders;

use App\Modules\Core\Models\Tenant;
use App\Modules\Sign\Models\SignRequest;
use Illuminate\Database\Seeder;

class SignSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();

        if (! $tenant) {
            return;
        }

        // NDA — sent and awaiting signatures
        SignRequest::create([
            'tenant_id'     => $tenant->id,
            'title'         => 'Non-Disclosure Agreement — Acme Corp Partnership',
            'document_path' => 'sign-documents/nda-acme-corp-2026.pdf',
            'document_name' => 'NDA_Acme_Corp_2026.pdf',
            'status'        => 'sent',
            'message'       => 'Please review and sign the attached NDA before our onboarding call on 10 July.',
        ]);

        // Service contract — completed
        SignRequest::create([
            'tenant_id'     => $tenant->id,
            'title'         => 'Annual Maintenance Service Contract',
            'document_path' => 'sign-documents/maintenance-contract-2026.pdf',
            'document_name' => 'Maintenance_Contract_2026.pdf',
            'status'        => 'completed',
            'message'       => 'Kindly sign the annual maintenance agreement to activate support coverage.',
            'completed_at'  => '2026-06-15 11:45:00',
        ]);
    }
}
