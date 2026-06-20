<?php

namespace App\Modules\Finance\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeadActivity extends Model
{
    use BelongsToTenant;

    protected $table = 'lead_activities';

    protected $fillable = [
        'tenant_id',
        'lead_id',
        'user_id',
        'type',
        'description',
        'activity_date',
        'outcome',
        'duration_minutes',
    ];

    protected $casts = [
        'activity_date'    => 'date',
        'duration_minutes' => 'integer',
    ];

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
