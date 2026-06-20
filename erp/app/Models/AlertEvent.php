<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AlertEvent extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'alert_rule_id',
        'message',
        'context',
        'triggered_at',
    ];

    protected $casts = [
        'context'      => 'array',
        'triggered_at' => 'datetime',
    ];

    public function rule(): BelongsTo
    {
        return $this->belongsTo(AlertRule::class);
    }
}
