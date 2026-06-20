<?php

namespace App\Modules\Finance\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

class Lead extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $table = 'leads';

    protected $fillable = [
        'tenant_id',
        'name',
        'email',
        'phone',
        'company',
        'source',
        'stage',
        'assigned_to',
        'estimated_value',
        'probability',
        'notes',
        'lost_reason',
        'won_at',
        'lost_at',
        'expected_close_date',
    ];

    protected $casts = [
        'estimated_value'     => 'decimal:2',
        'probability'         => 'integer',
        'won_at'              => 'date',
        'lost_at'             => 'date',
        'expected_close_date' => 'date',
    ];

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(LeadActivity::class);
    }

    public function markWon(): void
    {
        $this->stage       = 'won';
        $this->won_at      = Carbon::today();
        $this->probability = 100;
        $this->save();
    }

    public function markLost(string $reason): void
    {
        $this->stage       = 'lost';
        $this->lost_at     = Carbon::today();
        $this->lost_reason = $reason;
        $this->probability = 0;
        $this->save();
    }

    public function moveStage(string $stage): void
    {
        $this->stage = $stage;
        $this->save();
    }

    public function getWeightedValueAttribute(): float
    {
        if ($this->estimated_value === null) {
            return 0.0;
        }

        return (float) $this->estimated_value * $this->probability / 100;
    }
}
