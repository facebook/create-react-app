<?php

namespace Database\Seeders;

use App\Modules\Approvals\Models\ApprovalRequest;
use App\Modules\Core\Models\Tenant;
use Illuminate\Database\Seeder;

class ApprovalsSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();

        if (! $tenant) {
            return;
        }

        // Pending purchase order approval
        ApprovalRequest::create([
            'tenant_id'    => $tenant->id,
            'entity_type'  => 'purchase_order',
            'entity_id'    => 1,
            'entity_title' => 'PO-2026-001 — Office Equipment ($3,500)',
            'status'       => 'pending',
            'current_step' => 1,
            'total_steps'  => 2,
        ]);

        // Approved expense claim
        ApprovalRequest::create([
            'tenant_id'    => $tenant->id,
            'entity_type'  => 'expense_claim',
            'entity_id'    => 2,
            'entity_title' => 'EXP-2026-015 — Travel & Accommodation ($850)',
            'status'       => 'approved',
            'current_step' => 1,
            'total_steps'  => 1,
            'approved_at'  => now()->subDays(3),
        ]);

        // Rejected leave request
        ApprovalRequest::create([
            'tenant_id'       => $tenant->id,
            'entity_type'     => 'leave_request',
            'entity_id'       => 5,
            'entity_title'    => 'Annual Leave — Jane Smith (5 days)',
            'status'          => 'rejected',
            'current_step'    => 1,
            'total_steps'     => 1,
            'rejected_at'     => now()->subDays(1),
            'rejection_reason' => 'Insufficient leave balance for the requested period.',
        ]);
    }
}
