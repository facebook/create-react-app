<?php

namespace App\Modules\Finance\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class DebitNote extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id', 'debit_note_number', 'vendor_id', 'vendor_bill_id',
        'issue_date', 'currency', 'subtotal', 'tax', 'total',
        'status', 'reason', 'created_by',
    ];

    protected $attributes = [
        'status' => 'draft',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'subtotal'   => 'float',
        'tax'        => 'float',
        'total'      => 'float',
    ];

    // Relations

    public function items(): HasMany
    {
        return $this->hasMany(DebitNoteItem::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Contact::class, 'vendor_id');
    }

    // Methods

    public function generateDebitNoteNumber(): string
    {
        return 'DN-' . date('Y') . '-' . str_pad((string) $this->id, 5, '0', STR_PAD_LEFT);
    }

    public function recalculateTotals(): void
    {
        $items = $this->items()->get();
        $subtotal = $items->sum(fn ($item) => $item->quantity * $item->unit_price);
        $tax = $items->sum(fn ($item) => $item->quantity * $item->unit_price * $item->tax_rate / 100);
        $this->subtotal = $subtotal;
        $this->tax      = $tax;
        $this->total    = $subtotal + $tax;
        $this->save();
    }

    public function issue(): void
    {
        $this->status = 'issued';
        if (is_null($this->debit_note_number)) {
            $this->debit_note_number = $this->generateDebitNoteNumber();
        }
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

    public function getIsOpenAttribute(): bool
    {
        return in_array($this->status, ['draft', 'issued']);
    }

    public function getIsAvailableAttribute(): bool
    {
        return $this->status === 'issued';
    }
}
