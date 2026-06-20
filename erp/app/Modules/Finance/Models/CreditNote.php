<?php

namespace App\Modules\Finance\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CreditNote extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        // Phase 103 fields
        'tenant_id', 'credit_note_number', 'invoice_id', 'customer_id',
        'status', 'issue_date', 'currency', 'subtotal', 'tax', 'total',
        'reason', 'notes', 'created_by',
        // Legacy fields (kept for backwards compatibility)
        'reference', 'contact_id', 'original_invoice_id', 'original_bill_id',
        'type', 'currency_code', 'exchange_rate', 'tax_total', 'amount_applied',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'subtotal'   => 'float',
        'tax'        => 'float',
        'total'      => 'float',
        // Legacy casts
        'exchange_rate'  => 'float',
        'tax_total'      => 'float',
        'amount_applied' => 'float',
    ];

    // Relations
    public function items(): HasMany
    {
        return $this->hasMany(CreditNoteItem::class);
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class, 'original_invoice_id');
    }

    public function bill(): BelongsTo
    {
        return $this->belongsTo(Bill::class, 'original_bill_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Phase 103 methods
    public static function generateCreditNoteNumber(): string
    {
        return 'CN-' . strtoupper(uniqid());
    }

    public function recalculateTotals(): void
    {
        $subtotal = $this->items()->get()->sum(fn ($i) => $i->quantity * $i->unit_price);
        $this->subtotal = $subtotal;
        $this->total    = $subtotal + ($this->tax ?? 0);
        $this->save();
    }

    public function issue(): void
    {
        $this->status = 'issued';
        $this->save();
    }

    public function apply(): void
    {
        $this->status = 'applied';
        $this->save();
    }

    public function void(): void
    {
        $this->status = 'void';
        $this->save();
    }

    // Accessors
    public function getIsAvailableAttribute(): bool
    {
        return $this->status === 'issued';
    }

    public function getIsOpenAttribute(): bool
    {
        return in_array($this->status, ['draft', 'issued']);
    }

    public function getAmountRemainingAttribute(): float
    {
        return max(0, (float) ($this->total ?? 0) - (float) ($this->amount_applied ?? 0));
    }

    protected static function booted(): void
    {
        static::saving(function (self $cn) {
            // Legacy total calculation (when using old fields)
            if ($cn->relationLoaded('items') && $cn->items->count() > 0
                && $cn->getAttribute('subtotal') === null) {
                $cn->subtotal  = $cn->items->sum('line_total');
                $cn->tax_total = $cn->items->sum(fn ($i) => $i->line_total * $i->tax_rate / 100);
                $cn->total     = $cn->subtotal + $cn->tax_total;
            }
        });
    }
}
