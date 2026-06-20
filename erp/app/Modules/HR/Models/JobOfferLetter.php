<?php

namespace App\Modules\HR\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class JobOfferLetter extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'job_application_id',
        'candidate_name',
        'candidate_email',
        'position_title',
        'offered_salary',
        'proposed_start_date',
        'offer_expiry_date',
        'offer_terms',
        'status',
        'sent_at',
        'responded_at',
        'created_by',
    ];

    protected $casts = [
        'offered_salary'      => 'float',
        'proposed_start_date' => 'date',
        'offer_expiry_date'   => 'date',
        'sent_at'             => 'datetime',
        'responded_at'        => 'datetime',
    ];

    protected $attributes = ['status' => 'draft'];

    // ── Actions ───────────────────────────────────────────────────────────────

    public function send(): void
    {
        $this->update([
            'status'  => 'sent',
            'sent_at' => now(),
        ]);
    }

    public function accept(): void
    {
        $this->update([
            'status'       => 'accepted',
            'responded_at' => now(),
        ]);
    }

    public function decline(): void
    {
        $this->update([
            'status'       => 'declined',
            'responded_at' => now(),
        ]);
    }

    // ── Accessors ─────────────────────────────────────────────────────────────

    public function getIsExpiredAttribute(): bool
    {
        return $this->offer_expiry_date !== null
            && $this->offer_expiry_date->lt(today())
            && $this->status !== 'accepted';
    }

    public function getIsPendingAttribute(): bool
    {
        return $this->status === 'sent';
    }
}
