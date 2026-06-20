<?php

namespace App\Modules\Discuss\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class DiscussChannel extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $table = 'discuss_channels';

    protected $fillable = [
        'tenant_id', 'name', 'slug', 'description', 'type', 'is_archived', 'created_by',
    ];

    protected $casts = ['is_archived' => 'boolean'];

    // Relations

    public function messages(): HasMany
    {
        return $this->hasMany(DiscussMessage::class, 'channel_id');
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'discuss_channel_members', 'channel_id', 'user_id')
                    ->withPivot('last_read_at')
                    ->withTimestamps();
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function latestMessage(): HasMany
    {
        return $this->hasMany(DiscussMessage::class, 'channel_id')->latest()->limit(1);
    }

    // Helpers

    public static function createPublic(int $tenantId, int $creatorId, string $name, ?string $description = null): self
    {
        $channel = self::create([
            'tenant_id'   => $tenantId,
            'name'        => $name,
            'slug'        => Str::slug($name) . '-' . Str::random(6),
            'description' => $description,
            'type'        => 'public',
            'created_by'  => $creatorId,
        ]);

        $channel->members()->attach($creatorId, ['last_read_at' => now()]);

        return $channel;
    }

    public function getUnreadCountFor(int $userId): int
    {
        $member = $this->members()->where('user_id', $userId)->first();
        if (!$member) return 0;
        $lastRead = $member->pivot->last_read_at;
        if (!$lastRead) return $this->messages()->count();
        return $this->messages()->where('created_at', '>', $lastRead)->count();
    }

    public function markReadFor(int $userId): void
    {
        $this->members()->updateExistingPivot($userId, ['last_read_at' => now()]);
    }
}
