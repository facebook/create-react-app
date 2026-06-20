<?php

namespace App\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AlertRule extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'name',
        'type',
        'conditions',
        'notification_targets',
        'is_active',
        'last_triggered_at',
    ];

    protected $casts = [
        'conditions'           => 'array',
        'notification_targets' => 'array',
        'is_active'            => 'boolean',
        'last_triggered_at'    => 'datetime',
    ];

    public static array $supportedTypes = [
        'overdue_invoice'   => 'Invoice overdue by N days',
        'low_stock'         => 'Product stock below threshold',
        'high_receivables'  => 'Outstanding receivables above amount',
        'unresolved_ticket' => 'Helpdesk ticket unresolved for N hours',
        'payroll_pending'   => 'Payroll run awaiting approval',
    ];

    public function events(): HasMany
    {
        return $this->hasMany(AlertEvent::class);
    }
}
