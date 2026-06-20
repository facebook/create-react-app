<?php

namespace App\Modules\CRM\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmailSequenceStep extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'sequence_id',
        'step_number',
        'subject',
        'body',
        'delay_days',
    ];

    protected $casts = [
        'delay_days'  => 'integer',
        'step_number' => 'integer',
    ];

    public function sequence(): BelongsTo
    {
        return $this->belongsTo(EmailSequence::class, 'sequence_id');
    }
}
