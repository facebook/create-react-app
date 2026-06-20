<?php

namespace App\Modules\Core\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationInbox extends Model
{
    use BelongsToTenant;

    public const UPDATED_AT = null;

    public $timestamps = false;

    protected $table = 'notification_inbox';

    protected $fillable = [
        'tenant_id',
        'user_id',
        'title',
        'body',
        'type',
        'link',
        'is_read',
        'read_at',
        'created_at',
    ];

    protected $casts = [
        'is_read'    => 'boolean',
        'read_at'    => 'datetime',
        'created_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function markRead(): void
    {
        $this->is_read = true;
        $this->read_at = now();
        $this->save();
    }

    public static function send(
        int $tenantId,
        int $userId,
        string $title,
        string $type,
        ?string $body = null,
        ?string $link = null
    ): self {
        $notification = new self();
        $notification->tenant_id  = $tenantId;
        $notification->user_id    = $userId;
        $notification->title      = $title;
        $notification->type       = $type;
        $notification->body       = $body;
        $notification->link       = $link;
        $notification->is_read    = false;
        $notification->created_at = now();
        $notification->save();

        return $notification;
    }
}
