<?php

namespace App\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DashboardWidget extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'widget_type',
        'title',
        'config',
        'position',
        'size',
        'is_visible',
    ];

    protected $casts = [
        'config'     => 'array',
        'position'   => 'integer',
        'is_visible' => 'boolean',
    ];

    public static array $validTypes = ['kpi', 'chart', 'table', 'activity'];
    public static array $validSizes = ['sm', 'md', 'lg', 'xl'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
