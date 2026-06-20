<?php

namespace App\Modules\CRM\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CrmLead extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $table = 'crm_leads';

    protected $fillable = [
        'tenant_id', 'reference', 'title', 'type', 'stage_id', 'contact_name', 'company_name',
        'email', 'phone', 'website', 'source', 'expected_revenue', 'probability',
        'expected_close_date', 'priority', 'status', 'description', 'lost_reason',
        'assigned_to', 'created_by', 'won_at', 'lost_at',
    ];

    protected $casts = [
        'expected_revenue'    => 'float',
        'probability'         => 'float',
        'expected_close_date' => 'date',
        'won_at'              => 'datetime',
        'lost_at'             => 'datetime',
    ];

    protected $attributes = [
        'type'             => 'lead',
        'priority'         => 'normal',
        'status'           => 'open',
        'probability'      => 0,
        'expected_revenue' => 0,
    ];

    public function stage(): BelongsTo
    {
        return $this->belongsTo(CrmStage::class, 'stage_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(CrmActivity::class, 'lead_id')->orderByDesc('scheduled_at');
    }

    public function markWon(): void
    {
        $this->status      = 'won';
        $this->probability = 100;
        $this->won_at      = now();
        $this->save();
        event(new \App\Events\CRM\CrmDealWon($this));
    }

    public function markLost(string $reason = ''): void
    {
        $this->status      = 'lost';
        $this->probability = 0;
        $this->lost_reason = $reason;
        $this->lost_at     = now();
        $this->save();
    }

    public function convertToOpportunity(): void
    {
        $this->type = 'opportunity';
        if ($this->probability === 0.0) {
            $this->probability = 10;
        }
        $this->save();
    }

    public function generateReference(): string
    {
        return 'CRM-' . date('Y') . '-' . str_pad((string) $this->id, 5, '0', STR_PAD_LEFT);
    }

    protected function isWon(): Attribute
    {
        return Attribute::make(get: fn () => $this->status === 'won');
    }

    protected function isLost(): Attribute
    {
        return Attribute::make(get: fn () => $this->status === 'lost');
    }

    protected function isOpen(): Attribute
    {
        return Attribute::make(get: fn () => $this->status === 'open');
    }

    protected function priorityLabel(): Attribute
    {
        return Attribute::make(get: fn () => match ($this->priority) {
            'low'    => 'Low',
            'high'   => 'High',
            'urgent' => 'Urgent',
            default  => 'Normal',
        });
    }
}
