<?php

namespace App\Modules\KnowledgeBase\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class KbCategory extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $table = 'kb_categories';

    protected $fillable = [
        'tenant_id',
        'name',
        'slug',
        'description',
        'parent_id',
        'sequence',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(KbCategory::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(KbCategory::class, 'parent_id')->orderBy('sequence');
    }

    public function articles(): HasMany
    {
        return $this->hasMany(KbArticle::class, 'category_id');
    }

    public function articleCount(): int
    {
        return $this->articles()->count();
    }
}
