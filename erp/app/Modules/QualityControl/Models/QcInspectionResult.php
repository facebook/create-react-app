<?php

namespace App\Modules\QualityControl\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QcInspectionResult extends Model
{
    use BelongsToTenant;

    protected $table = 'quality_inspection_results';

    protected $fillable = [
        'tenant_id',
        'inspection_id',
        'checklist_item_id',
        'result',
        'measured_value',
        'notes',
    ];

    public function inspection(): BelongsTo
    {
        return $this->belongsTo(QcInspection::class, 'inspection_id');
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(QcChecklistItem::class, 'checklist_item_id');
    }
}
