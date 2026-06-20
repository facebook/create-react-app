<?php

namespace App\Modules\Discuss\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class DiscussMessage extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $table = 'discuss_messages';

    protected $fillable = [
        'tenant_id', 'channel_id', 'user_id', 'body', 'parent_id', 'is_edited', 'is_pinned',
    ];

    protected $casts = ['is_edited' => 'boolean', 'is_pinned' => 'boolean'];

    // Relations

    public function channel(): BelongsTo
    {
        return $this->belongsTo(DiscussChannel::class, 'channel_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    // Actions

    public function edit(string $newBody): void
    {
        $this->body      = $newBody;
        $this->is_edited = true;
        $this->save();
    }

    public function pin(): void
    {
        $this->is_pinned = true;
        $this->save();
    }

    public function unpin(): void
    {
        $this->is_pinned = false;
        $this->save();
    }
}
