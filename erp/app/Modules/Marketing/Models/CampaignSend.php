<?php

namespace App\Modules\Marketing\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CampaignSend extends Model
{
    protected $table = 'campaign_sends';

    protected $fillable = [
        'campaign_id',
        'subscriber_id',
        'status',
        'sent_at',
        'opened_at',
        'clicked_at',
    ];

    protected $casts = [
        'sent_at'    => 'datetime',
        'opened_at'  => 'datetime',
        'clicked_at' => 'datetime',
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(EmailCampaign::class, 'campaign_id');
    }

    public function subscriber(): BelongsTo
    {
        return $this->belongsTo(Subscriber::class, 'subscriber_id');
    }

    public function markOpened(): void
    {
        if (!in_array($this->status, ['opened', 'clicked'])) {
            $this->status    = 'opened';
            $this->opened_at = now();
            $this->save();
            $this->campaign()->increment('open_count');
        }
    }

    public function markClicked(): void
    {
        $this->status     = 'clicked';
        $this->clicked_at = now();
        $this->save();
        $this->campaign()->increment('click_count');
    }
}
