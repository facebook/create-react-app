<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPreference extends Model
{
    protected $fillable = ['user_id', 'key', 'value'];

    public static array $defaults = [
        'timezone'         => 'UTC',
        'date_format'      => 'Y-m-d',
        'time_format'      => 'H:i',
        'language'         => 'en',
        'currency_display' => 'code', // code | symbol
        'items_per_page'   => '25',
        'compact_mode'     => 'false',
        'sidebar_collapsed' => 'false',
        'notifications_email' => 'true',
        'notifications_push'  => 'true',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function getForUser(int $userId, string $key): mixed
    {
        $pref = static::where('user_id', $userId)->where('key', $key)->first();
        return $pref ? $pref->value : (static::$defaults[$key] ?? null);
    }

    public static function getAllForUser(int $userId): array
    {
        $stored = static::where('user_id', $userId)
            ->get()
            ->pluck('value', 'key')
            ->toArray();

        return array_merge(static::$defaults, $stored);
    }

    public static function setForUser(int $userId, string $key, string $value): self
    {
        return static::updateOrCreate(
            ['user_id' => $userId, 'key' => $key],
            ['value' => $value]
        );
    }
}
