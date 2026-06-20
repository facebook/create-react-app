<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class QualityAlert extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'product_id',
        'alert_number',
        'title',
        'description',
        'alert_type',
        'severity',
        'status',
        'affected_quantity',
        'affected_batch',
        'root_cause',
        'corrective_action',
        'resolved_at',
        'reported_by',
        'assigned_to',
        'created_by',
    ];

    protected $attributes = [
        'status'            => 'open',
        'severity'          => 'medium',
        'alert_type'        => 'defect',
        'affected_quantity' => 0,
    ];

    protected $casts = [
        'affected_quantity' => 'integer',
        'resolved_at'       => 'datetime',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function investigate(): void
    {
        $this->status = 'investigating';
        $this->save();
    }

    public function resolve(string $rootCause, string $correctiveAction): void
    {
        $this->status            = 'resolved';
        $this->root_cause        = $rootCause;
        $this->corrective_action = $correctiveAction;
        $this->resolved_at       = now();
        $this->save();
    }

    public function close(): void
    {
        $this->status = 'closed';
        $this->save();
    }

    public function generateAlertNumber(): string
    {
        return 'QA-' . date('Y') . '-' . str_pad((string) $this->id, 5, '0', STR_PAD_LEFT);
    }

    public function getIsOpenAttribute(): bool
    {
        return $this->status === 'open';
    }

    public function getIsCriticalAttribute(): bool
    {
        return $this->severity === 'critical';
    }

    public function getIsResolvedAttribute(): bool
    {
        return $this->status === 'resolved' || $this->status === 'closed';
    }
}
