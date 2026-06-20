<?php

namespace App\Modules\HR\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SkillDefinition extends Model
{
    use BelongsToTenant;

    protected $fillable = ['tenant_id', 'name', 'category', 'description', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function employeeSkills(): HasMany
    {
        return $this->hasMany(EmployeeSkill::class);
    }
}
