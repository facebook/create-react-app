<?php

namespace App\Modules\Inventory\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class RmaRequest extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $table = 'rma_requests';

    protected $fillable = [
        'tenant_id',
        'rma_number',
        'type',
        'status',
        'contact_name',
        'reference',
        'reason',
        'disposition',
        'requested_date',
        'received_date',
        'inspected_date',
        'notes',
        'warehouse_id',
        'created_by',
        'approved_by',
    ];

    protected $casts = [
        'requested_date' => 'date',
        'received_date'  => 'date',
        'inspected_date' => 'date',
    ];

    protected $attributes = [
        'type'        => 'customer_return',
        'status'      => 'pending',
        'disposition' => 'restock',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(RmaRequestItem::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function approve(int $userId): void
    {
        if ($this->rma_number === null) {
            $this->rma_number = $this->generateRmaNumber();
        }
        $this->status      = 'approved';
        $this->approved_by = $userId;
        $this->save();
    }

    public function receive(): void
    {
        $this->status        = 'received';
        $this->received_date = now()->toDateString();
        $this->save();
    }

    public function inspect(): void
    {
        $this->status         = 'inspected';
        $this->inspected_date = now()->toDateString();
        $this->save();
    }

    public function close(): void
    {
        $this->status = 'closed';
        $this->save();
    }

    public function reject(): void
    {
        $this->status = 'rejected';
        $this->save();
    }

    public function generateRmaNumber(): string
    {
        return 'RMA-' . date('Y') . '-' . str_pad((string) $this->id, 5, '0', STR_PAD_LEFT);
    }

    protected function isPending(): Attribute
    {
        return Attribute::make(get: fn () => $this->status === 'pending');
    }

    protected function isApproved(): Attribute
    {
        return Attribute::make(get: fn () => $this->status === 'approved');
    }

    protected function isReceived(): Attribute
    {
        return Attribute::make(get: fn () => $this->status === 'received');
    }

    protected function totalItems(): Attribute
    {
        return Attribute::make(get: fn () => $this->items()->count());
    }
}
