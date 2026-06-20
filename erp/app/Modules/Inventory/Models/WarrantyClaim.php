<?php

namespace App\Modules\Inventory\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

class WarrantyClaim extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'claim_number',
        'product_warranty_id',
        'serial_number_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'purchase_date',
        'claim_date',
        'warranty_expiry',
        'status',
        'issue_description',
        'resolution_type',
        'resolution_notes',
        'resolved_date',
        'created_by',
        'assigned_to',
    ];

    protected $casts = [
        'purchase_date'    => 'date',
        'claim_date'       => 'date',
        'warranty_expiry'  => 'date',
        'resolved_date'    => 'date',
    ];

    protected $attributes = [
        'status' => 'open',
    ];

    public function warranty(): BelongsTo
    {
        return $this->belongsTo(ProductWarranty::class, 'product_warranty_id');
    }

    public function serialNumber(): BelongsTo
    {
        return $this->belongsTo(SerialNumber::class, 'serial_number_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function approve(): void
    {
        $this->status = 'approved';
        $this->save();
    }

    public function reject(): void
    {
        $this->status = 'rejected';
        $this->save();
    }

    public function resolve(string $resolutionType, ?string $notes = null): void
    {
        $this->status           = 'resolved';
        $this->resolution_type  = $resolutionType;
        $this->resolution_notes = $notes;
        $this->resolved_date    = Carbon::today();
        $this->save();
    }

    public function generateClaimNumber(): string
    {
        return 'WC-' . now()->year . '-' . str_pad((string) $this->id, 5, '0', STR_PAD_LEFT);
    }

    public function isOpen(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'open',
        );
    }

    public function isResolved(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'resolved',
        );
    }
}
