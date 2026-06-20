<?php

namespace App\Modules\Finance\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProfitCenter extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'code',
        'name',
        'type',
        'status',
        'parent_id',
        'manager_id',
        'budget',
        'description',
    ];

    protected $casts = [
        'budget' => 'float',
    ];

    protected $attributes = [
        'type'   => 'profit',
        'status' => 'active',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(ProfitCenter::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(ProfitCenter::class, 'parent_id');
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function activate(): void
    {
        $this->status = 'active';
        $this->save();
    }

    public function deactivate(): void
    {
        $this->status = 'inactive';
        $this->save();
    }

    protected function isActive(): Attribute
    {
        return Attribute::make(get: fn () => $this->status === 'active');
    }

    protected function isCostCenter(): Attribute
    {
        return Attribute::make(get: fn () => $this->type === 'cost');
    }

    protected function isProfitCenter(): Attribute
    {
        return Attribute::make(get: fn () => $this->type === 'profit');
    }
}
