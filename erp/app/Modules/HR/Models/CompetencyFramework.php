<?php

namespace App\Modules\HR\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CompetencyFramework extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'name',
        'code',
        'description',
        'status',
        'is_default',
        'created_by',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    protected $attributes = [
        'status'     => 'draft',
        'is_default' => false,
    ];

    public function competencies(): HasMany
    {
        return $this->hasMany(Competency::class);
    }

    public function activate(): void
    {
        $this->status = 'active';
        $this->save();
    }

    public function archive(): void
    {
        $this->status = 'archived';
        $this->save();
    }

    public function getIsActiveAttribute(): bool
    {
        return $this->status === 'active';
    }

    public function getCompetencyCountAttribute(): int
    {
        return $this->competencies()->count();
    }
}
