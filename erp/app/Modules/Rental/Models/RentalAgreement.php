<?php

namespace App\Modules\Rental\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class RentalAgreement extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'rental_item_id',
        'customer_name',
        'customer_email',
        'start_date',
        'end_date',
        'daily_rate',
        'deposit',
        'status',
        'notes',
        'returned_at',
    ];

    protected $casts = [
        'start_date'  => 'date',
        'end_date'    => 'date',
        'returned_at' => 'datetime',
    ];

    public function item(): BelongsTo
    {
        return $this->belongsTo(RentalItem::class, 'rental_item_id');
    }

    public function daysRented(): int
    {
        $end = $this->end_date ?? Carbon::today();
        return (int) $this->start_date->diffInDays($end) + 1;
    }

    public function totalAmount(): float
    {
        return (float) ($this->daily_rate * $this->daysRented());
    }

    public function isOverdue(): bool
    {
        return $this->end_date !== null
            && $this->end_date->lt(Carbon::today())
            && $this->status === 'active';
    }

    public function return(Carbon $returnedAt = null): void
    {
        $this->update([
            'status'      => 'returned',
            'returned_at' => $returnedAt ?? now(),
        ]);

        if ($this->item) {
            $this->item->update(['status' => 'available']);
        }
    }

    public function cancel(): void
    {
        $this->update(['status' => 'cancelled']);

        if ($this->item) {
            $this->item->update(['status' => 'available']);
        }
    }
}
