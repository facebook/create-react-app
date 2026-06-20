<?php

namespace App\Modules\Finance\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use App\Modules\Core\Traits\HasAuditLog;
use App\Modules\Finance\Traits\HasLineItemTotals;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class RecurringInvoice extends Model
{
    use BelongsToTenant;
    use HasAuditLog;
    use SoftDeletes;
    use HasLineItemTotals;

    protected $fillable = [
        'tenant_id', 'contact_id', 'reference_prefix', 'frequency', 'interval',
        'start_date', 'next_run_date', 'end_date', 'due_days', 'status',
        'auto_send', 'currency_code', 'exchange_rate', 'notes',
        'last_generated_at', 'generated_count', 'created_by',
    ];

    protected $casts = [
        'start_date'        => 'date',
        'next_run_date'     => 'date',
        'end_date'          => 'date',
        'auto_send'         => 'boolean',
        'last_generated_at' => 'datetime',
    ];

    protected $attributes = [
        'status'           => 'active',
        'frequency'        => 'monthly',
        'interval'         => 1,
        'reference_prefix' => 'REC-INV',
        'currency_code'    => 'USD',
        'exchange_rate'    => 1,
        'due_days'         => 30,
        'generated_count'  => 0,
        'auto_send'        => false,
    ];

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(RecurringInvoiceItem::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class, 'recurring_invoice_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Compute the next run date relative to a given Carbon date,
     * respecting both the frequency and the interval multiplier.
     */
    public function computeNextRunDate(\Carbon\Carbon $from): \Carbon\Carbon
    {
        $n = (int) ($this->interval ?? 1);

        return match ($this->frequency) {
            'weekly'    => $from->copy()->addWeeks($n),
            'quarterly' => $from->copy()->addMonthsNoOverflow($n * 3),
            'yearly'    => $from->copy()->addYears($n),
            default     => $from->copy()->addMonthsNoOverflow($n),
        };
    }

    public function scopeDue($query)
    {
        return $query->where('status', 'active')
            ->whereDate('next_run_date', '<=', now()->toDateString());
    }

    protected function intervalAdvance(\Carbon\Carbon $date): \Carbon\Carbon
    {
        return $this->computeNextRunDate($date);
    }

    public function advanceSchedule(): void
    {
        $next = $this->computeNextRunDate(\Carbon\Carbon::parse($this->next_run_date));

        if ($this->end_date && $next->gt(\Carbon\Carbon::parse($this->end_date))) {
            $this->status = 'ended';
        } else {
            $this->next_run_date = $next->toDateString();
        }

        $this->save();
    }

    public function generateInvoice(): Invoice
    {
        return DB::transaction(function () {
            if (! $this->relationLoaded('items')) {
                $this->load('items');
            }

            $nextCount   = $this->generated_count + 1;
            $prefix      = $this->reference_prefix ?: 'REC-INV';
            $refNumber   = "{$prefix}-{$nextCount}";

            $invoice = Invoice::create([
                'tenant_id'            => $this->tenant_id,
                'recurring_invoice_id' => $this->id,
                'contact_id'           => $this->contact_id,
                'number'               => $refNumber,
                'issue_date'           => now()->toDateString(),
                'due_date'             => now()->addDays($this->due_days)->toDateString(),
                'status'               => $this->auto_send ? 'sent' : 'draft',
                'currency_code'        => $this->currency_code ?? 'USD',
                'exchange_rate'        => $this->exchange_rate ?? 1,
                'notes'                => $this->notes,
                'created_by'           => $this->created_by,
            ]);

            foreach ($this->items as $item) {
                InvoiceItem::create([
                    'invoice_id'  => $invoice->id,
                    'description' => $item->description,
                    'quantity'    => $item->quantity,
                    'unit_price'  => $item->unit_price,
                    'tax_rate'    => $item->tax_rate,
                ]);
            }

            $this->generated_count   = $nextCount;
            $this->last_generated_at = now();
            $this->save();

            $this->advanceSchedule();

            return $invoice;
        });
    }
}
