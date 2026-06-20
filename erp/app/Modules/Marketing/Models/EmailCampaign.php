<?php

namespace App\Modules\Marketing\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EmailCampaign extends Model
{
    use BelongsToTenant;

    protected $table = 'email_campaigns';

    protected $fillable = [
        'tenant_id',
        'name',
        'subject',
        'preview_text',
        'body_html',
        'body_text',
        'from_name',
        'from_email',
        'mailing_list_id',
        'status',
        'scheduled_at',
        'sent_at',
        'total_recipients',
        'sent_count',
        'open_count',
        'click_count',
        'bounce_count',
        'unsubscribe_count',
        'created_by',
    ];

    protected $casts = [
        'scheduled_at'       => 'datetime',
        'sent_at'            => 'datetime',
        'total_recipients'   => 'integer',
        'sent_count'         => 'integer',
        'open_count'         => 'integer',
        'click_count'        => 'integer',
        'bounce_count'       => 'integer',
        'unsubscribe_count'  => 'integer',
    ];

    public function mailingList(): BelongsTo
    {
        return $this->belongsTo(MailingList::class, 'mailing_list_id');
    }

    public function sends(): HasMany
    {
        return $this->hasMany(CampaignSend::class, 'campaign_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function events(): HasMany
    {
        return $this->hasMany(CampaignEvent::class, 'campaign_id');
    }

    public function abVariants(): HasMany
    {
        return $this->hasMany(AbTestVariant::class, 'campaign_id');
    }

    public function totalSent(): int
    {
        return $this->events()->where('event_type', 'sent')->count();
    }

    public function openRate(): float
    {
        return $this->sent_count > 0
            ? round($this->open_count / $this->sent_count * 100, 1)
            : 0;
    }

    public function clickRate(): float
    {
        return $this->sent_count > 0
            ? round($this->click_count / $this->sent_count * 100, 1)
            : 0;
    }

    public function send(): void
    {
        $this->status  = 'sending';
        $this->sent_at = now();
        $this->save();

        $subscribers = collect();
        if ($this->mailing_list_id) {
            $subscribers = $this->mailingList
                ->subscribers()
                ->where('status', 'subscribed')
                ->get();
        }

        foreach ($subscribers as $subscriber) {
            CampaignSend::firstOrCreate(
                ['campaign_id' => $this->id, 'subscriber_id' => $subscriber->id],
                ['status' => 'sent', 'sent_at' => now()]
            );
        }

        $count = $this->sends()->count();
        $this->total_recipients = $count;
        $this->sent_count       = $count;
        $this->status           = 'sent';
        $this->save();
    }

    public function cancel(): void
    {
        $this->status = 'cancelled';
        $this->save();
    }
}
