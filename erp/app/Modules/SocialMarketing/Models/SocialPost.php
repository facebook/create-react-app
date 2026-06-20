<?php

namespace App\Modules\SocialMarketing\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SocialPost extends Model
{
    use BelongsToTenant;

    protected $table = 'social_posts';

    protected $fillable = [
        'tenant_id',
        'content',
        'media_urls',
        'platforms',
        'social_account_ids',
        'status',
        'scheduled_at',
        'published_at',
        'campaign_id',
        'error_message',
        'metrics',
        'created_by',
    ];

    protected $casts = [
        'media_urls'         => 'array',
        'platforms'          => 'array',
        'social_account_ids' => 'array',
        'metrics'            => 'array',
        'scheduled_at'       => 'datetime',
        'published_at'       => 'datetime',
    ];

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function schedule(Carbon $date): void
    {
        $this->update([
            'status'       => 'scheduled',
            'scheduled_at' => $date,
        ]);
    }

    public function publish(): void
    {
        $this->update([
            'status'       => 'published',
            'published_at' => now(),
        ]);
    }

    public function markFailed(string $error): void
    {
        $this->update([
            'status'        => 'failed',
            'error_message' => $error,
        ]);
    }

    public function getTotalReach(): int
    {
        return $this->metrics['reach'] ?? 0;
    }

    public function getTotalEngagement(): int
    {
        return ($this->metrics['likes'] ?? 0)
            + ($this->metrics['shares'] ?? 0)
            + ($this->metrics['comments'] ?? 0);
    }

    public function isScheduled(): bool
    {
        return $this->status === 'scheduled'
            && $this->scheduled_at !== null
            && $this->scheduled_at->isFuture();
    }
}
