<?php

namespace App\Services;

use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Invoice;
use Illuminate\Support\Facades\DB;

class CreditLimitService
{
    public function getOutstandingBalance(Contact $contact): float
    {
        return (float) DB::table('invoice_items')
            ->join('invoices', 'invoices.id', '=', 'invoice_items.invoice_id')
            ->where('invoices.contact_id', $contact->id)
            ->whereIn('invoices.status', ['sent', 'partial'])
            ->whereNull('invoices.deleted_at')
            ->sum(DB::raw('invoice_items.quantity * invoice_items.unit_price'));
    }

    public function getAvailableCredit(Contact $contact): float
    {
        if ($contact->credit_limit <= 0) {
            return PHP_FLOAT_MAX;
        }

        $outstanding = $this->getOutstandingBalance($contact);
        return max(0, $contact->credit_limit - $outstanding);
    }

    public function wouldExceedLimit(Contact $contact, float $amount): bool
    {
        if ($contact->credit_limit <= 0) {
            return false;
        }

        $outstanding = $this->getOutstandingBalance($contact);
        return ($outstanding + $amount) > $contact->credit_limit;
    }

    public function getCreditStatus(Contact $contact): array
    {
        $outstanding     = $this->getOutstandingBalance($contact);
        $available       = $this->getAvailableCredit($contact);
        $limitSet        = $contact->credit_limit > 0;
        $utilizationPct  = $limitSet
            ? min(100, round(($outstanding / $contact->credit_limit) * 100, 2))
            : 0;

        return [
            'contact_id'          => $contact->id,
            'contact_name'        => $contact->name,
            'credit_limit'        => $contact->credit_limit,
            'credit_terms_days'   => $contact->credit_terms_days,
            'credit_hold'         => $contact->credit_hold,
            'outstanding_balance' => round($outstanding, 2),
            'available_credit'    => $limitSet ? round($available, 2) : null,
            'utilization_percent' => $utilizationPct,
            'is_over_limit'       => $limitSet && $outstanding > $contact->credit_limit,
            'limit_set'           => $limitSet,
        ];
    }

    public function getContactsNearLimit(int $tenantId, float $threshold = 80.0): array
    {
        $contacts = Contact::where('tenant_id', $tenantId)
            ->customers()
            ->where('credit_limit', '>', 0)
            ->get();

        $alerts = [];
        foreach ($contacts as $contact) {
            $status = $this->getCreditStatus($contact);
            if ($status['utilization_percent'] >= $threshold || $contact->credit_hold) {
                $alerts[] = $status;
            }
        }

        usort($alerts, fn ($a, $b) => $b['utilization_percent'] <=> $a['utilization_percent']);
        return $alerts;
    }
}
