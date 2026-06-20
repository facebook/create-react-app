<?php

namespace App\Modules\HR\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Competency extends Model
{
    protected $fillable = [
        'competency_framework_id',
        'name',
        'category',
        'description',
        'max_level',
    ];

    protected $casts = [
        'max_level' => 'integer',
    ];

    protected $attributes = [
        'max_level' => 5,
    ];

    public function framework(): BelongsTo
    {
        return $this->belongsTo(CompetencyFramework::class);
    }
}
