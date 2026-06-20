<?php

namespace App\Modules\Finance\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorProfile extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'contact_id',
        'credit_limit',
        'payment_terms_days',
        'preferred_currency',
        'bank_name',
        'bank_account_number',
        'bank_routing_number',
        'notes',
    ];

    protected $casts = [
        'credit_limit' => 'decimal:2',
    ];

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    public function getIsOverCreditLimitAttribute(): bool
    {
        if (is_null($this->credit_limit)) {
            return false;
        }

        if (! $this->relationLoaded('contact')) {
            $this->load('contact');
        }

        if (! $this->contact) {
            return false;
        }

        $bills = $this->contact->bills()
            ->whereIn('status', ['received', 'partial'])
            ->with(['items', 'payments'])
            ->get();

        $outstanding = $bills->sum(fn ($bill) => $bill->amount_due);

        return $outstanding > (float) $this->credit_limit;
    }
}
