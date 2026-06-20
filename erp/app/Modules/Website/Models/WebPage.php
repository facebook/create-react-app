<?php

namespace App\Modules\Website\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class WebPage extends Model
{
    use BelongsToTenant;

    protected $table = 'web_pages';

    protected $fillable = [
        'tenant_id',
        'title',
        'slug',
        'content',
        'meta_title',
        'meta_description',
        'status',
        'published_at',
        'is_homepage',
        'layout',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'is_homepage'  => 'boolean',
    ];

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
}
