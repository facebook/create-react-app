<?php

namespace App\Modules\QualityControl\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QcInspection extends Model
{
    use BelongsToTenant;

    protected $table = 'quality_inspections';

    protected $fillable = [
        'tenant_id',
        'checklist_id',
        'reference_type',
        'reference_id',
        'inspector_id',
        'status',
        'notes',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'started_at'   => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function checklist(): BelongsTo
    {
        return $this->belongsTo(QcChecklist::class, 'checklist_id');
    }

    public function results(): HasMany
    {
        return $this->hasMany(QcInspectionResult::class, 'inspection_id');
    }

    public function inspector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'inspector_id');
    }

    public function start(): void
    {
        $this->update([
            'status'     => 'in_progress',
            'started_at' => now(),
        ]);
    }

    public function complete(string $outcome): void
    {
        $this->update([
            'status'       => $outcome,
            'completed_at' => now(),
        ]);
    }

    public function cancel(): void
    {
        $this->update(['status' => 'cancelled']);
    }

    public function passRate(): float
    {
        $results = $this->results;

        if ($results->isEmpty()) {
            return 0.0;
        }

        $passCount = $results->where('result', 'pass')->count();

        return ($passCount / $results->count()) * 100;
    }
}
