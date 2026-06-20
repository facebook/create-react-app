<?php

namespace App\Modules\Survey\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Survey extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'title',
        'description',
        'status',
        'starts_at',
        'ends_at',
        'created_by',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at'   => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function questions(): HasMany
    {
        return $this->hasMany(SurveyQuestion::class)->orderBy('sequence');
    }

    public function responses(): HasMany
    {
        return $this->hasMany(SurveyResponse::class);
    }

    public function publish(): void
    {
        if ($this->starts_at === null) {
            $this->starts_at = now();
        }
        $this->status = 'published';
        $this->save();
    }

    public function close(): void
    {
        $this->status   = 'closed';
        $this->ends_at  = now();
        $this->save();
    }

    public function responseCount(): int
    {
        return $this->responses()->count();
    }

    public function isOpen(): bool
    {
        return $this->status === 'published'
            && ($this->ends_at === null || $this->ends_at->gt(now()));
    }
}
