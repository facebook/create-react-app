<?php

namespace App\Modules\Finance\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class IntercompanyTransaction extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $attributes = [
        'status'   => 'draft',
        'currency' => 'USD',
    ];

    protected $fillable = [
        'tenant_id', 'transaction_number', 'from_entity', 'to_entity',
        'amount', 'currency', 'transaction_date', 'transaction_type',
        'description', 'status', 'created_by',
    ];

    protected $casts = [
        'amount'           => 'float',
        'transaction_date' => 'date',
    ];

    public function generateTransactionNumber(): string
    {
        return 'IC-' . date('Y') . '-' . str_pad((string) $this->id, 5, '0', STR_PAD_LEFT);
    }

    public function post(): void
    {
        $this->status = 'posted';
        if (is_null($this->transaction_number)) {
            $this->transaction_number = $this->generateTransactionNumber();
        }
        $this->save();
    }

    public function reconcile(): void
    {
        $this->status = 'reconciled';
        $this->save();
    }

    public function reverse(): void
    {
        $this->status = 'reversed';
        $this->save();
    }

    public function getIsPostedAttribute(): bool
    {
        return $this->status === 'posted';
    }

    public function getIsDraftAttribute(): bool
    {
        return $this->status === 'draft';
    }
}
