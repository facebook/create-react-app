<?php

namespace App\Modules\Marketing\Models;

use App\Modules\Core\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MailingList extends Model
{
    use BelongsToTenant;

    protected $table = 'mailing_lists';

    protected $fillable = [
        'tenant_id',
        'name',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function subscribers(): BelongsToMany
    {
        return $this->belongsToMany(Subscriber::class, 'mailing_list_subscriber');
    }

    public function campaigns(): HasMany
    {
        return $this->hasMany(EmailCampaign::class, 'mailing_list_id');
    }
}
