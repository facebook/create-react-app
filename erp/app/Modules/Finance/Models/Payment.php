<?php

namespace App\Modules\Finance\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use App\Modules\Core\Traits\HasAuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use BelongsToTenant;
    use HasAuditLog;

    protected $fillable = [
        'tenant_id', 'invoice_id', 'amount',
        'payment_date', 'method', 'reference', 'notes', 'batch_payment_id',
    ];

    protected $casts = [
        'amount'       => 'decimal:2',
        'payment_date' => 'date',
    ];

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function batchPayment(): BelongsTo
    {
        return $this->belongsTo(BatchPayment::class);
    }
}
