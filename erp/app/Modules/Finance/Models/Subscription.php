<?php

namespace App\Modules\Finance\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class Subscription extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id', 'plan_id', 'customer_name', 'customer_email', 'status',
        'trial_ends_at', 'current_period_start', 'current_period_end',
        'cancelled_at', 'notes',
    ];

    protected $casts = [
        'trial_ends_at'        => 'date',
        'current_period_start' => 'date',
        'current_period_end'   => 'date',
        'cancelled_at'         => 'datetime',
    ];

    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'plan_id');
    }

    public function activate(): void
    {
        $today = Carbon::today()->toDateString();
        $this->status                = 'active';
        $this->current_period_start  = $today;
        $this->current_period_end    = $this->plan->getNextBillingDate($today);
        $this->save();
    }

    public function cancel(): void
    {
        $this->status       = 'cancelled';
        $this->cancelled_at = Carbon::now();
        $this->save();
    }

    public function pause(): void
    {
        $this->status = 'paused';
        $this->save();
    }

    public function generateInvoice(): Invoice
    {
        $today  = Carbon::today()->toDateString();
        $plan   = $this->plan;

        $periodStart = $this->current_period_start
            ? $this->current_period_start->toDateString()
            : $today;
        $periodEnd = $this->current_period_end
            ? $this->current_period_end->toDateString()
            : $plan->getNextBillingDate($today);

        $period = "{$periodStart} - {$periodEnd}";

        $invoice = DB::transaction(function () use ($today, $plan, $period) {
            $inv = Invoice::create([
                'tenant_id'  => $this->tenant_id,
                'status'     => 'draft',
                'issue_date' => $today,
                'due_date'   => Carbon::today()->addDays(30)->toDateString(),
            ]);

            InvoiceItem::create([
                'invoice_id'  => $inv->id,
                'description' => "Subscription: {$plan->name} ({$period})",
                'quantity'    => 1,
                'unit_price'  => $plan->price,
                'tax_rate'    => 0,
            ]);

            return $inv;
        });

        return $invoice;
    }
}
