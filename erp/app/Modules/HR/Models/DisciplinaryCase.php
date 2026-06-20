<?php

namespace App\Modules\HR\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class DisciplinaryCase extends Model
{
    use BelongsToTenant;
    use SoftDeletes;

    protected $fillable = [
        'tenant_id', 'employee_id', 'reference', 'incident_type',
        'incident_date', 'description', 'severity', 'status',
        'outcome', 'outcome_notes', 'handled_by', 'hearing_date', 'resolved_date',
    ];

    protected $casts = [
        'incident_date' => 'date',
        'hearing_date'  => 'date',
        'resolved_date' => 'date',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function handledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'handled_by');
    }

    public function scheduleHearing(Carbon $date): void
    {
        $this->hearing_date = $date;
        $this->status       = 'hearing_scheduled';
        $this->save();
    }

    public function resolve(string $outcome, ?string $notes = null): void
    {
        $this->outcome       = $outcome;
        $this->outcome_notes = $notes;
        $this->status        = 'resolved';
        $this->resolved_date = now()->toDateString();
        $this->save();
    }

    public function close(): void
    {
        $this->status = 'closed';
        $this->save();
    }

    public function getIsOpenAttribute(): bool
    {
        return !in_array($this->status, ['resolved', 'closed']);
    }
}
