<?php

namespace App\Modules\QualityControl\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QcChecklist extends Model
{
    use BelongsToTenant;

    protected $table = 'quality_checklists';

    protected $fillable = [
        'tenant_id',
        'name',
        'description',
        'category',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(QcChecklistItem::class, 'checklist_id');
    }

    public function inspections(): HasMany
    {
        return $this->hasMany(QcInspection::class, 'checklist_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
