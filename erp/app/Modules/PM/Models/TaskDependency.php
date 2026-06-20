<?php

namespace App\Modules\PM\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskDependency extends Model
{
    use BelongsToTenant;

    protected $table = 'task_dependencies';

    protected $fillable = [
        'tenant_id',
        'task_id',
        'depends_on_id',
        'dependency_type',
    ];

    protected $casts = [
        'dependency_type' => 'string',
    ];

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class, 'task_id');
    }

    public function dependsOn(): BelongsTo
    {
        return $this->belongsTo(Task::class, 'depends_on_id');
    }
}
