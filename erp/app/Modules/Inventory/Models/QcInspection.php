<?php

namespace App\Modules\Inventory\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class QcInspection extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'qc_checklist_id',
        'product_id',
        'inspector_id',
        'batch_reference',
        'status',
        'overall_result',
        'notes',
        'inspected_at',
    ];

    protected $casts = [
        'inspected_at' => 'datetime',
    ];

    public function checklist(): BelongsTo
    {
        return $this->belongsTo(QcChecklist::class, 'qc_checklist_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function inspector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'inspector_id');
    }

    public function results(): HasMany
    {
        return $this->hasMany(QcInspectionResult::class);
    }

    public function getPassRateAttribute(): ?float
    {
        $results = $this->results;
        if ($results->isEmpty()) {
            return null;
        }

        return round($results->where('result', 'pass')->count() / $results->count() * 100, 1);
    }

    public function complete(string $overallResult): void
    {
        $this->status         = $overallResult === 'pass' ? 'passed' : 'failed';
        $this->overall_result = $overallResult;
        $this->inspected_at   = now();
        $this->inspector_id   = auth()->id();
        $this->save();
    }
}
