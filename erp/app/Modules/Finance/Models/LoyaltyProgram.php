<?php

namespace App\Modules\Finance\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class LoyaltyProgram extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $table = 'loyalty_programs';

    protected $fillable = [
        'tenant_id',
        'name',
        'description',
        'points_per_currency_unit',
        'points_to_currency_rate',
        'minimum_redemption_points',
        'is_active',
        'tier_config',
    ];

    protected $casts = [
        'points_per_currency_unit'  => 'decimal:4',
        'points_to_currency_rate'   => 'decimal:6',
        'minimum_redemption_points' => 'integer',
        'is_active'                 => 'boolean',
        'tier_config'               => 'array',
    ];

    public function enrollments(): HasMany
    {
        return $this->hasMany(LoyaltyEnrollment::class);
    }

    public function calculatePointsEarned(float $amount): int
    {
        return (int) floor($amount * $this->points_per_currency_unit);
    }

    public function calculateRedemptionValue(int $points): float
    {
        return round($points * $this->points_to_currency_rate, 2);
    }

    public function getTierForPoints(int $points): ?array
    {
        $tiers = $this->tier_config;

        if (empty($tiers)) {
            return null;
        }

        usort($tiers, fn ($a, $b) => $b['min_points'] <=> $a['min_points']);

        foreach ($tiers as $tier) {
            if ($points >= $tier['min_points']) {
                return $tier;
            }
        }

        return null;
    }
}
