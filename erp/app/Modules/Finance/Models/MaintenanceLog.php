<?php

namespace App\Modules\Finance\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceLog extends Model
{
    use BelongsToTenant;

    protected $table = 'maintenance_logs';

    protected $fillable = [
        'tenant_id', 'service_agreement_id', 'technician_id', 'log_date',
        'description', 'status', 'resolution', 'hours_spent', 'next_service_date',
    ];

    protected $casts = [
        'log_date'          => 'date',
        'next_service_date' => 'date',
        'hours_spent'       => 'decimal:2',
    ];

    public function agreement(): BelongsTo
    {
        return $this->belongsTo(ServiceAgreement::class, 'service_agreement_id');
    }

    public function technician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'technician_id');
    }

    public function complete(string $resolution): void
    {
        $this->status     = 'completed';
        $this->resolution = $resolution;
        $this->save();
    }
}
