<?php

namespace App\Modules\SocialMarketing\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SocialAccount extends Model
{
    use BelongsToTenant;

    protected $table = 'social_accounts';

    protected $fillable = [
        'tenant_id',
        'platform',
        'account_name',
        'account_handle',
        'avatar_url',
        'is_connected',
        'is_active',
        'followers_count',
        'following_count',
        'last_synced_at',
    ];

    protected $casts = [
        'is_connected'    => 'boolean',
        'is_active'       => 'boolean',
        'followers_count' => 'integer',
        'following_count' => 'integer',
        'last_synced_at'  => 'datetime',
    ];

    public function posts(): HasMany
    {
        return $this->hasMany(SocialPost::class)->whereJsonContains('social_account_ids', $this->id);
    }

    public function getPlatformColor(): string
    {
        return match ($this->platform) {
            'facebook'  => '#1877F2',
            'twitter'   => '#1DA1F2',
            'linkedin'  => '#0A66C2',
            'instagram' => '#E4405F',
            'youtube'   => '#FF0000',
            'tiktok'    => '#000000',
            default     => '#6B7280',
        };
    }

    public function getPlatformIcon(): string
    {
        return $this->platform;
    }

    public function disconnect(): void
    {
        $this->update(['is_connected' => false]);
    }

    public function reconnect(): void
    {
        $this->update([
            'is_connected'   => true,
            'last_synced_at' => now(),
        ]);
    }
}
