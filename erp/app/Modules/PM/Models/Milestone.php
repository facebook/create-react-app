<?php

namespace App\Modules\PM\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Milestone extends Model
{
    use BelongsToTenant;

    protected $table = 'milestones';

    protected $fillable = [
        'tenant_id', 'project_id', 'name', 'description',
        'due_date', 'is_completed', 'completed_at', 'created_by',
    ];

    protected $casts = [
        'due_date'     => 'date',
        'completed_at' => 'datetime',
        'is_completed' => 'boolean',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function complete(): void
    {
        $this->is_completed = true;
        $this->completed_at = now();
        $this->save();
    }
}
