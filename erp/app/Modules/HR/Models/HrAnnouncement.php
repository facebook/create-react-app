<?php

namespace App\Modules\HR\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class HrAnnouncement extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id', 'title', 'body', 'target_audience', 'department_id',
        'is_published', 'publish_at', 'expire_at', 'created_by', 'priority',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'publish_at'   => 'datetime',
        'expire_at'    => 'datetime',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function publish(): void
    {
        $this->is_published = true;
        $this->publish_at   = $this->publish_at ?? now();
        $this->save();
    }

    public function archive(): void
    {
        $this->is_published = false;
        $this->expire_at    = now();
        $this->save();
    }

    public function getIsActiveAttribute(): bool
    {
        if (! $this->is_published) {
            return false;
        }
        if ($this->expire_at !== null && $this->expire_at->isPast()) {
            return false;
        }
        return true;
    }
}
