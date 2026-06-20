<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class TenantFeature extends Model
{
    protected $fillable = [
        'tenant_id',
        'feature',
        'is_enabled',
        'config',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
        'config'     => 'array',
    ];

    public static array $availableFeatures = [
        'recurring_invoices'   => ['description' => 'Auto-generate invoices on a schedule'],
        'customer_portal'      => ['description' => 'Customer self-service portal'],
        'webhooks'             => ['description' => 'Outbound webhook integrations'],
        'two_factor_auth'      => ['description' => 'Two-factor authentication for users'],
        'audit_log'            => ['description' => 'Track all model changes'],
        'email_templates'      => ['description' => 'Customise email templates'],
        'report_schedules'     => ['description' => 'Schedule automatic report delivery'],
        'api_access'           => ['description' => 'REST API access for external apps'],
        'sso'                  => ['description' => 'Single sign-on via SAML/OAuth'],
        'advanced_analytics'   => ['description' => 'Enhanced analytics and reporting'],
    ];

    public static function isEnabled(int $tenantId, string $feature): bool
    {
        return Cache::remember("tenant_feature_{$tenantId}_{$feature}", 300, function () use ($tenantId, $feature) {
            $record = static::where('tenant_id', $tenantId)
                ->where('feature', $feature)
                ->first();

            // Default: enabled if no explicit record (opt-in by default)
            return $record === null ? true : $record->is_enabled;
        });
    }

    public static function toggle(int $tenantId, string $feature, bool $enabled, ?array $config = null): self
    {
        $instance = static::updateOrCreate(
            ['tenant_id' => $tenantId, 'feature' => $feature],
            ['is_enabled' => $enabled, 'config' => $config]
        );

        Cache::forget("tenant_feature_{$tenantId}_{$feature}");

        return $instance;
    }
}
