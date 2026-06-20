<?php

namespace App\Modules\Finance\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use App\Modules\Core\Traits\HasAuditLog;
use App\Traits\LogsActivity;
use App\Modules\Finance\Traits\HasLineItemTotals;
use App\Modules\Finance\Traits\HasAttachments;
use App\Modules\Finance\Traits\HasStatusTransitions;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use BelongsToTenant;
    use HasAuditLog;
    use LogsActivity;
    use SoftDeletes;
    use HasLineItemTotals;
    use HasAttachments;
    use HasStatusTransitions;

    protected $fillable = [
        'tenant_id', 'recurring_invoice_id', 'sales_order_id', 'contact_id', 'assigned_to_user_id', 'number',
        'issue_date', 'due_date', 'status', 'notes', 'created_by',
        'currency_code', 'exchange_rate',
    ];

    protected $casts = [
        'issue_date'    => 'date',
        'due_date'      => 'date',
        'exchange_rate' => 'float',
    ];

    protected $attributes = ['status' => 'draft'];

    protected function getTransitions(): array
    {
        return [
            'draft'     => ['sent', 'cancelled'],
            'sent'      => ['partial', 'paid', 'cancelled'],
            'partial'   => ['paid', 'cancelled'],
            'paid'      => [],
            'cancelled' => [],
        ];
    }

    public function getBaseTotalAttribute(): float
    {
        return round($this->total * (float) $this->exchange_rate, 2);
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function recurringInvoice(): BelongsTo
    {
        return $this->belongsTo(RecurringInvoice::class);
    }

    public function salesOrder(): BelongsTo
    {
        return $this->belongsTo(SalesOrder::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to_user_id');
    }
}