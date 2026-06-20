<?php

namespace App\Modules\HR\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Grievance extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id', 'employee_id', 'reference', 'category',
        'description', 'status', 'resolution', 'is_anonymous',
        'assigned_to', 'submitted_date', 'resolved_date',
    ];

    protected $casts = [
        'submitted_date' => 'date',
        'resolved_date'  => 'date',
        'is_anonymous'   => 'boolean',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function resolve(string $resolution): void
    {
        $this->resolution    = $resolution;
        $this->status        = 'resolved';
        $this->resolved_date = now()->toDateString();
        $this->save();
    }

    public function close(): void
    {
        $this->status = 'closed';
        $this->save();
    }

    public function assign(int $userId): void
    {
        $this->assigned_to = $userId;
        $this->status      = 'under_review';
        $this->save();
    }
}
