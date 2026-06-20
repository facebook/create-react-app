<?php

namespace App\Modules\Inventory\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class StockPicking extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'picking_number',
        'picking_type',
        'status',
        'warehouse_id',
        'source_location_id',
        'destination_location_id',
        'origin',
        'partner_name',
        'scheduled_date',
        'done_date',
        'notes',
        'created_by',
        'validated_by',
    ];

    protected $attributes = [
        'picking_type' => 'incoming',
        'status'       => 'draft',
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'done_date'      => 'date',
    ];

    // Relations

    public function lines(): HasMany
    {
        return $this->hasMany(StockPickingLine::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function sourceLocation(): BelongsTo
    {
        return $this->belongsTo(WarehouseZone::class, 'source_location_id');
    }

    public function destinationLocation(): BelongsTo
    {
        return $this->belongsTo(WarehouseZone::class, 'destination_location_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function validator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'validated_by');
    }

    // Methods

    public function confirm(): void
    {
        if ($this->picking_number === null) {
            $this->picking_number = $this->generatePickingNumber();
        }
        $this->status = 'confirmed';
        $this->save();
    }

    public function startProcessing(): void
    {
        $this->status = 'in_progress';
        $this->save();
    }

    public function validate(int $userId): void
    {
        $this->status       = 'done';
        $this->done_date    = now();
        $this->validated_by = $userId;
        $this->save();
    }

    public function cancel(): void
    {
        $this->status = 'cancelled';
        $this->save();
    }

    public function generatePickingNumber(): string
    {
        $prefix = match ($this->picking_type) {
            'outgoing'  => 'WH/OUT/',
            'internal'  => 'WH/INT/',
            'return'    => 'WH/RET/',
            default     => 'WH/IN/',
        };

        return $prefix . date('Y') . '/' . str_pad((string) $this->id, 5, '0', STR_PAD_LEFT);
    }

    // Accessors

    protected function isDraft(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'draft',
        );
    }

    protected function isConfirmed(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'confirmed',
        );
    }

    protected function isDone(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'done',
        );
    }

    protected function totalLines(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->lines()->count(),
        );
    }

    protected function pickingTypeLabel(): Attribute
    {
        return Attribute::make(
            get: fn () => match ($this->picking_type) {
                'outgoing'  => 'Outgoing Delivery',
                'internal'  => 'Internal Transfer',
                'return'    => 'Return',
                default     => 'Incoming Receipt',
            },
        );
    }
}
