<?php

namespace App\Modules\Approvals\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ApprovalWorkflow extends Model
{
    use BelongsToTenant;

    protected $table = 'approval_workflows';

    protected $fillable = [
        'tenant_id',
        'name',
        'entity_type',
        'min_amount',
        'max_amount',
        'is_active',
    ];

    protected $casts = [
        'min_amount' => 'float',
        'max_amount' => 'float',
        'is_active'  => 'boolean',
    ];

    public function steps(): HasMany
    {
        return $this->hasMany(ApprovalStep::class, 'workflow_id')->orderBy('step_number');
    }

    public function requests(): HasMany
    {
        return $this->hasMany(ApprovalRequest::class, 'workflow_id');
    }

    public function stepCount(): int
    {
        return $this->steps()->count();
    }

    public static function findFor(string $entityType, float $amount = 0, int $tenantId): ?self
    {
        return self::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->where('entity_type', $entityType)
            ->where('is_active', true)
            ->where(function ($query) use ($amount) {
                $query->whereNull('min_amount')
                    ->orWhere('min_amount', '<=', $amount);
            })
            ->where(function ($query) use ($amount) {
                $query->whereNull('max_amount')
                    ->orWhere('max_amount', '>=', $amount);
            })
            ->first();
    }
}
