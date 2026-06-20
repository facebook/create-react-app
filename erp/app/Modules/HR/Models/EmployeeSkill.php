<?php

namespace App\Modules\HR\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeSkill extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'employee_id', 'skill_definition_id', 'skill_name',
        'proficiency_level', 'is_verified', 'verified_by', 'verified_at',
        'acquired_date', 'notes',
    ];

    protected $attributes = [
        'is_verified'       => false,
        'proficiency_level' => 1,
    ];

    protected $casts = [
        'proficiency_level' => 'integer',
        'is_verified'       => 'boolean',
        'verified_at'       => 'datetime',
        'acquired_date'     => 'date',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function definition(): BelongsTo
    {
        return $this->belongsTo(SkillDefinition::class, 'skill_definition_id');
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function verify(int $userId): void
    {
        $this->is_verified = true;
        $this->verified_by = $userId;
        $this->verified_at = now();
        $this->save();
    }

    public function getProficiencyLabelAttribute(): string
    {
        return match ($this->proficiency_level) {
            1 => 'Beginner',
            2 => 'Basic',
            3 => 'Intermediate',
            4 => 'Advanced',
            5 => 'Expert',
            default => 'Unknown',
        };
    }
}
