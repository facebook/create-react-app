<?php

namespace App\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportSchedule extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'name',
        'report_type',
        'frequency',
        'recipients',
        'filters',
        'is_active',
        'last_sent_at',
        'next_run_at',
    ];

    protected $casts = [
        'recipients'  => 'array',
        'filters'     => 'array',
        'is_active'   => 'boolean',
        'last_sent_at' => 'datetime',
        'next_run_at'  => 'datetime',
    ];

    public static array $validFrequencies = ['daily', 'weekly', 'monthly'];
    public static array $validReportTypes = ['financial', 'inventory', 'hr'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function computeNextRunAt(): \Carbon\Carbon
    {
        return match ($this->frequency) {
            'daily'   => now()->addDay()->startOfDay(),
            'weekly'  => now()->addWeek()->startOfWeek(),
            'monthly' => now()->addMonth()->startOfMonth(),
            default   => now()->addDay()->startOfDay(),
        };
    }
}
