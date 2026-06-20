<?php

namespace App\Modules\HR\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class SuccessionPlan extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'position_title',
        'department',
        'description',
        'status',
        'is_critical',
        'current_holder_id',
        'created_by',
    ];

    protected $casts = [
        'is_critical' => 'boolean',
    ];

    protected $attributes = [
        'status'      => 'active',
        'is_critical' => false,
    ];

    public function candidates(): HasMany
    {
        return $this->hasMany(SuccessionCandidate::class);
    }

    public function currentHolder(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'current_holder_id');
    }

    public function complete(): void
    {
        $this->status = 'completed';
        $this->save();
    }

    public function deactivate(): void
    {
        $this->status = 'inactive';
        $this->save();
    }

    public function getIsActiveAttribute(): bool
    {
        return $this->status === 'active';
    }

    public function getCandidateCountAttribute(): int
    {
        return $this->candidates()->count();
    }
}
