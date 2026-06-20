<?php

namespace App\Modules\Core\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\User;

class Company extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id', 'name', 'code', 'tax_id', 'currency_code',
        'fiscal_year_start', 'logo_path', 'address', 'phone', 'email',
        'website', 'industry', 'is_active', 'parent_company_id', 'created_by',
    ];

    protected $casts = [
        'is_active'          => 'boolean',
        'fiscal_year_start'  => 'integer',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'parent_company_id');
    }

    public function subsidiaries(): HasMany
    {
        return $this->hasMany(Company::class, 'parent_company_id');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->withPivot('is_default')->withTimestamps();
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    protected function fullName(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->code ? "{$this->name} ({$this->code})" : $this->name
        );
    }

    protected function isParent(): Attribute
    {
        return Attribute::make(
            get: fn () => is_null($this->parent_company_id)
        );
    }
}
