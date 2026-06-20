<?php

namespace App\Modules\CRM\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class LeadScoringRule extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'name',
        'field',
        'condition_value',
        'points',
        'is_active',
    ];

    protected $casts = [
        'points'    => 'integer',
        'is_active' => 'boolean',
    ];

    public function matchesLead(CrmLead $lead): bool
    {
        if (!$this->is_active) {
            return false;
        }

        return match ($this->field) {
            'source' => $lead->source === $this->condition_value,
            'stage'  => (string) $lead->stage_id === $this->condition_value,
            'tag'    => false,
            default  => false,
        };
    }

    public static function scoreForLead(CrmLead $lead): int
    {
        return static::where('tenant_id', $lead->tenant_id)
            ->where('is_active', true)
            ->get()
            ->filter(fn ($rule) => $rule->matchesLead($lead))
            ->sum('points');
    }
}
