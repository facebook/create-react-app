<?php

namespace App\Modules\QualityControl\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QcChecklistItem extends Model
{
    use BelongsToTenant;

    protected $table = 'quality_checklist_items';

    protected $fillable = [
        'tenant_id',
        'checklist_id',
        'description',
        'check_type',
        'expected_value',
        'unit',
        'is_required',
        'sequence',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'sequence'    => 'integer',
    ];

    public function checklist(): BelongsTo
    {
        return $this->belongsTo(QcChecklist::class, 'checklist_id');
    }
}
