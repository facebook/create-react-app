<?php

namespace App\Modules\Inventory\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QcInspectionResult extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'qc_inspection_id',
        'qc_checklist_item_id',
        'result',
        'notes',
    ];

    public function inspection(): BelongsTo
    {
        return $this->belongsTo(QcInspection::class, 'qc_inspection_id');
    }

    public function checklistItem(): BelongsTo
    {
        return $this->belongsTo(QcChecklistItem::class, 'qc_checklist_item_id');
    }
}
