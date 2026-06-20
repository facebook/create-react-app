<?php

namespace App\Modules\Marketing\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AbTestVariant extends Model
{
    use BelongsToTenant;

    protected $table = 'ab_test_variants';

    protected $fillable = [
        'tenant_id',
        'campaign_id',
        'name',
        'subject_line',
        'preview_text',
        'send_percentage',
        'is_winner',
        'opens',
        'clicks',
        'sent',
    ];

    protected $casts = [
        'is_winner'       => 'boolean',
        'opens'           => 'integer',
        'clicks'          => 'integer',
        'sent'            => 'integer',
        'send_percentage' => 'integer',
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(EmailCampaign::class, 'campaign_id');
    }

    public function openRate(): float
    {
        return $this->sent > 0 ? round($this->opens / $this->sent * 100, 2) : 0;
    }

    public function clickRate(): float
    {
        return $this->sent > 0 ? round($this->clicks / $this->sent * 100, 2) : 0;
    }

    public function declareWinner(): void
    {
        // Update other variants of same campaign to is_winner = false
        static::where('campaign_id', $this->campaign_id)
            ->where('id', '!=', $this->id)
            ->update(['is_winner' => false]);

        $this->is_winner = true;
        $this->save();
    }
}
