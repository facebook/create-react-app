<?php

namespace App\Modules\Finance\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LoyaltyEnrollment extends Model
{
    use BelongsToTenant;

    protected $table = 'loyalty_enrollments';

    protected $fillable = [
        'tenant_id',
        'loyalty_program_id',
        'contact_id',
        'points_balance',
        'total_points_earned',
        'total_points_redeemed',
        'enrolled_at',
        'tier_name',
    ];

    protected $casts = [
        'points_balance'        => 'integer',
        'total_points_earned'   => 'integer',
        'total_points_redeemed' => 'integer',
        'enrolled_at'           => 'datetime',
    ];

    public function program(): BelongsTo
    {
        return $this->belongsTo(LoyaltyProgram::class, 'loyalty_program_id');
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(LoyaltyTransaction::class);
    }

    public function earnPoints(int $points, string $description = '', ?int $referenceId = null): LoyaltyTransaction
    {
        $this->increment('points_balance', $points);
        $this->increment('total_points_earned', $points);
        $this->refresh();

        return LoyaltyTransaction::create([
            'tenant_id'            => $this->tenant_id,
            'loyalty_enrollment_id' => $this->id,
            'type'                 => 'earn',
            'points'               => $points,
            'description'          => $description,
            'reference_id'         => $referenceId,
            'balance_after'        => $this->points_balance,
        ]);
    }

    public function redeemPoints(int $points, string $description = ''): LoyaltyTransaction
    {
        if ($points > $this->points_balance) {
            throw new \Exception('Insufficient points balance.');
        }

        $this->decrement('points_balance', $points);
        $this->increment('total_points_redeemed', $points);
        $this->refresh();

        return LoyaltyTransaction::create([
            'tenant_id'            => $this->tenant_id,
            'loyalty_enrollment_id' => $this->id,
            'type'                 => 'redeem',
            'points'               => $points,
            'description'          => $description,
            'balance_after'        => $this->points_balance,
        ]);
    }

    public function updateTier(): void
    {
        $tier = $this->program->getTierForPoints($this->total_points_earned);
        $this->tier_name = $tier['name'] ?? null;
        $this->save();
    }
}
