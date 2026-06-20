<?php

namespace App\Modules\Website\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class BlogPost extends Model
{
    use BelongsToTenant;

    protected $table = 'blog_posts';

    protected $fillable = [
        'tenant_id',
        'title',
        'slug',
        'excerpt',
        'content',
        'author_id',
        'featured_image',
        'status',
        'published_at',
        'tags',
        'view_count',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'tags'         => 'array',
    ];

    public function publish(): void
    {
        $this->status       = 'published';
        $this->published_at = now();
        $this->save();
    }

    public function incrementViews(): void
    {
        $this->increment('view_count');
    }
}
