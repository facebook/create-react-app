<?php

namespace App\Modules\Helpdesk\Models;

use App\Models\User;
use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HelpdeskTeam extends Model
{
    use BelongsToTenant;

    protected $table = 'helpdesk_teams';

    protected $fillable = [
        'tenant_id',
        'name',
        'description',
        'auto_assign',
        'is_active',
    ];

    protected $casts = [
        'auto_assign' => 'boolean',
        'is_active'   => 'boolean',
    ];

    public function tickets(): HasMany
    {
        return $this->hasMany(HelpdeskTicket::class, 'team_id');
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'helpdesk_team_user', 'helpdesk_team_id', 'user_id');
    }
}
