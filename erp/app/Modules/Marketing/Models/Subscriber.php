<?php

namespace App\Modules\Marketing\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subscriber extends Model
{
    use BelongsToTenant;

    protected $table = 'subscribers';

    protected $fillable = [
        'tenant_id',
        'email',
        'name',
        'status',
        'subscribed_at',
        'unsubscribed_at',
        'source',
    ];

    protected $casts = [
        'subscribed_at'   => 'datetime',
        'unsubscribed_at' => 'datetime',
    ];

    public function mailingLists(): BelongsToMany
    {
        return $this->belongsToMany(MailingList::class, 'mailing_list_subscriber');
    }

    public function sends(): HasMany
    {
        return $this->hasMany(CampaignSend::class, 'subscriber_id');
    }

    public function subscribe(): void
    {
        $this->status          = 'subscribed';
        $this->subscribed_at   = now();
        $this->unsubscribed_at = null;
        $this->save();
    }

    public function unsubscribe(): void
    {
        $this->status          = 'unsubscribed';
        $this->unsubscribed_at = now();
        $this->save();
    }

    public function isSubscribed(): bool
    {
        return $this->status === 'subscribed';
    }
}
