<?php

namespace App\Modules\FieldService\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceOrderChecklistResult extends Model
{
    protected $fillable = [
        'service_order_id',
        'checklist_item_id',
        'is_checked',
        'notes',
    ];

    protected $casts = [
        'is_checked' => 'boolean',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(ServiceOrder::class, 'service_order_id');
    }

    public function checklistItem(): BelongsTo
    {
        return $this->belongsTo(ServiceChecklistItem::class, 'checklist_item_id');
    }
}
