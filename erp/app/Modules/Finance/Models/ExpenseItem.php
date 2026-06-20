<?php

namespace App\Modules\Finance\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExpenseItem extends Model
{
    protected $table = 'finance_expense_items';

    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'expense_claim_id',
        'category',
        'expense_date',
        'description',
        'amount',
        'receipt_url',
    ];

    protected $casts = [
        'expense_date' => 'date',
        'amount'       => 'float',
    ];

    public function claim(): BelongsTo
    {
        return $this->belongsTo(ExpenseClaim::class);
    }
}
