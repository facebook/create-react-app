<?php

namespace App\Modules\POS\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PosOrder extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $table = 'pos_orders';

    protected $fillable = [
        'tenant_id',
        'session_id',
        'receipt_number',
        'customer_name',
        'customer_email',
        'subtotal',
        'discount_amount',
        'tax_amount',
        'total',
        'amount_paid',
        'change_given',
        'payment_method',
        'status',
        'notes',
        'served_by',
        'created_by',
    ];

    protected $casts = [
        'subtotal'        => 'float',
        'discount_amount' => 'float',
        'tax_amount'      => 'float',
        'total'           => 'float',
        'amount_paid'     => 'float',
        'change_given'    => 'float',
        'status'          => 'string',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(PosSession::class, 'session_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(PosOrderItem::class, 'order_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(PosPayment::class, 'order_id');
    }

    public function servedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'served_by');
    }

    public function generateReceiptNumber(): string
    {
        return 'REC-' . date('Y') . '-' . str_pad((string) $this->id, 5, '0', STR_PAD_LEFT);
    }

    public function recalculate(): void
    {
        $subtotal = $this->items()->sum('line_total');
        $this->subtotal = $subtotal;
        $this->total    = $subtotal - $this->discount_amount + $this->tax_amount;
        $this->save();
    }
}
