<?php

namespace Database\Seeders;

use App\Modules\Core\Models\Tenant;
use App\Modules\Helpdesk\Models\HelpdeskTicket;
use Illuminate\Database\Seeder;

class HelpdeskSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();

        if (! $tenant) {
            return;
        }

        $userId = \App\Models\User::first()->id ?? 1;

        HelpdeskTicket::create([
            'tenant_id'      => $tenant->id,
            'ticket_number'  => 'HD-2026-00001',
            'subject'        => 'Cannot log in to the customer portal',
            'description'    => 'After the latest update, the customer portal login page throws a 500 error. Multiple users are affected.',
            'type'           => 'issue',
            'priority'       => 'urgent',
            'status'         => 'in_progress',
            'customer_name'  => 'Sandra Wells',
            'customer_email' => 's.wells@customer.example',
            'assigned_to'    => $userId,
            'created_by'     => $userId,
            'sla_deadline'   => now()->addHours(4),
        ]);

        HelpdeskTicket::create([
            'tenant_id'      => $tenant->id,
            'ticket_number'  => 'HD-2026-00002',
            'subject'        => 'Request for bulk export of invoices',
            'description'    => 'We need to export all invoices from 2024 in PDF format for our year-end audit.',
            'type'           => 'feature_request',
            'priority'       => 'medium',
            'status'         => 'open',
            'customer_name'  => 'Finance Team – Acme Corp',
            'customer_email' => 'finance@acme.example',
            'created_by'     => $userId,
            'sla_deadline'   => now()->addDays(3),
        ]);

        HelpdeskTicket::create([
            'tenant_id'         => $tenant->id,
            'ticket_number'     => 'HD-2026-00003',
            'subject'           => 'How to add a secondary approver in purchase orders?',
            'description'       => 'Looking for guidance on configuring a two-level approval workflow for POs above $10,000.',
            'type'              => 'question',
            'priority'          => 'low',
            'status'            => 'resolved',
            'customer_name'     => 'David Kim',
            'customer_email'    => 'd.kim@globex.example',
            'assigned_to'       => $userId,
            'created_by'        => $userId,
            'first_response_at' => now()->subDays(1)->subHours(3),
            'resolved_at'       => now()->subHours(5),
        ]);
    }
}
