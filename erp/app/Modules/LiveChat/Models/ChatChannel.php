<?php

namespace App\Modules\LiveChat\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChatChannel extends Model
{
    use BelongsToTenant;

    protected $table = 'chat_channels';

    protected $fillable = [
        'tenant_id',
        'name',
        'widget_color',
        'welcome_message',
        'offline_message',
        'is_active',
        'assigned_agents',
    ];

    protected $casts = [
        'is_active'       => 'boolean',
        'assigned_agents' => 'array',
    ];

    public function sessions(): HasMany
    {
        return $this->hasMany(ChatSession::class, 'channel_id');
    }
}
