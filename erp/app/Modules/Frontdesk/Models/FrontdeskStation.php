<?php

namespace App\Modules\Frontdesk\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FrontdeskStation extends Model
{
    use BelongsToTenant;

    protected $table = 'frontdesk_stations';

    protected $fillable = [
        'tenant_id',
        'name',
        'location',
        'is_active',
        'responsible_id',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function visitors(): HasMany
    {
        return $this->hasMany(VisitorLog::class, 'station_id');
    }

    public function responsible(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responsible_id');
    }

    public function checkedInCount(): int
    {
        return $this->visitors()->where('status', 'checked_in')->count();
    }
}
