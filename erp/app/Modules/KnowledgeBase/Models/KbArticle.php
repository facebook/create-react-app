<?php

namespace App\Modules\KnowledgeBase\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class KbArticle extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $table = 'kb_articles';

    protected $fillable = [
        'tenant_id',
        'category_id',
        'title',
        'slug',
        'content',
        'excerpt',
        'status',
        'author_id',
        'views',
        'tags',
        'published_at',
    ];

    protected $casts = [
        'tags'         => 'array',
        'published_at' => 'datetime',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(KbCategory::class, 'category_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function publish(): void
    {
        $this->status       = 'published';
        $this->published_at = now();
        $this->save();
    }

    public function archive(): void
    {
        $this->status = 'archived';
        $this->save();
    }

    public function incrementViews(): void
    {
        $this->increment('views');
    }

    public function generateSlug(string $title): string
    {
        $slug = Str::slug($title);
        $original = $slug;
        $count = 1;

        while (
            static::withoutGlobalScopes()
                ->where('slug', $slug)
                ->where('tenant_id', $this->tenant_id)
                ->where('id', '!=', $this->id ?? 0)
                ->exists()
        ) {
            $slug = $original . '-' . $count;
            $count++;
        }

        return $slug;
    }

    public function isPublished(): bool
    {
        return $this->status === 'published';
    }
}
