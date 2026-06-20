<?php

namespace App\Modules\Finance\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use App\Modules\Core\Traits\HasAuditLog;
use App\Modules\Finance\Traits\HasLineItemTotals;
use App\Modules\Finance\Traits\HasStatusTransitions;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class SalesOrder extends Model
{
    use BelongsToTenant;
    use HasAuditLog;
    use SoftDeletes;
    use HasLineItemTotals;
    use HasStatusTransitions;

    protected $fillable = [
        'tenant_id', 'contact_id', 'warehouse_id', 'invoice_id', 'number',
        'reference', 'order_date', 'expected_date', 'status', 'notes', 'created_by',
        'currency_code', 'exchange_rate',
    ];

    protected $casts = [
        'order_date'    => 'date',
        'expected_date' => 'date',
    ];

    protected $attributes = ['status' => 'draft'];

    protected function getTransitions(): array
    {
        return [
            'draft'     => ['confirmed', 'cancelled'],
            'confirmed' => ['fulfilled', 'invoiced', 'cancelled'],
            'fulfilled' => ['invoiced'],
            'invoiced'  => [],
            'cancelled' => [],
        ];
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(\App\Modules\Inventory\Models\Warehouse::class);
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function generatedInvoice(): HasOne
    {
        return $this->hasOne(Invoice::class, 'sales_order_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(SalesOrderItem::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** Convert this confirmed SO to a new Invoice and mark SO as invoiced. */
    public function convertToInvoice(): Invoice
    {
        abort_unless($this->status === 'confirmed', 422, 'Only confirmed orders can be invoiced.');
        $this->load('items');

        $ref = $this->reference ?? $this->number;
        $invoiceRef = $ref ? 'INV-' . preg_replace('/^SO-/', '', $ref) : null;

        $invoice = Invoice::create([
            'tenant_id'      => $this->tenant_id,
            'sales_order_id' => $this->id,
            'contact_id'     => $this->contact_id,
            'issue_date'     => now()->toDateString(),
            'due_date'       => now()->addDays(30)->toDateString(),
            'status'         => 'draft',
            'notes'          => $this->notes,
            'created_by'     => auth()->id(),
            'currency_code'  => $this->currency_code ?? 'USD',
            'exchange_rate'  => $this->exchange_rate ?? 1,
        ]);

        if ($invoiceRef) {
            $invoice->update(['number' => $invoiceRef]);
        } else {
            $invoice->update([
                'number' => 'INV-' . now()->format('Y') . '-' . str_pad((string) $invoice->id, 5, '0', STR_PAD_LEFT),
            ]);
        }

        foreach ($this->items as $item) {
            $invoice->items()->create([
                'description' => $item->description,
                'quantity'    => $item->quantity,
                'unit_price'  => $item->unit_price,
                'tax_rate'    => $item->tax_rate,
            ]);
        }

        $this->update(['status' => 'invoiced', 'invoice_id' => $invoice->id]);

        return $invoice;
    }

    public function fulfill(): void
    {
        if (! $this->canTransitionTo('fulfilled')) {
            throw new \DomainException("Sales order cannot be fulfilled in status '{$this->status}'.");
        }

        if (! $this->warehouse_id) {
            throw new \DomainException('A warehouse is required to fulfill this order.');
        }

        \Illuminate\Support\Facades\DB::transaction(function () {
            foreach ($this->items as $item) {
                if (! $item->product_id) {
                    $item->update(['quantity_fulfilled' => $item->quantity]);
                    continue;
                }

                \App\Modules\Inventory\Models\StockMovement::record([
                    'product_id'   => $item->product_id,
                    'warehouse_id' => $this->warehouse_id,
                    'type'         => 'out',
                    'quantity'     => (float) $item->quantity,
                    'reference'    => $this->number,
                    'notes'        => "Fulfilled SO #{$this->id}",
                ]);

                $item->update(['quantity_fulfilled' => $item->quantity]);
            }

            $this->update(['status' => 'fulfilled']);
        });
    }
}
