<?php

namespace App\Modules\FieldService\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceChecklistItem extends Model
{
    protected $fillable = [
        'checklist_id',
        'label',
        'sequence',
    ];

    public function checklist(): BelongsTo
    {
        return $this->belongsTo(ServiceChecklist::class, 'checklist_id');
    }
}
