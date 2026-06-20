<?php

namespace App\Http\Middleware;

use App\Modules\Core\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TenantMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = $this->resolveTenant($request);

        if ($tenant === null) {
            abort(404, 'Tenant not found.');
        }

        if (! $tenant->is_active) {
            abort(403, 'Tenant is inactive.');
        }

        app()->instance('tenant', $tenant);
        $request->attributes->set('tenant', $tenant);

        return $next($request);
    }

    private function resolveTenant(Request $request): ?Tenant
    {
        // 1. Try X-Tenant header (API clients)
        if ($slug = $request->header('X-Tenant')) {
            return Tenant::where('slug', $slug)->first();
        }

        // 2. Try subdomain
        $host = $request->getHost();
        $parts = explode('.', $host);
        if (count($parts) >= 3) {
            $subdomain = $parts[0];
            return Tenant::where('slug', $subdomain)->first();
        }

        // 3. Try full domain match
        return Tenant::where('domain', $host)->first();
    }
}
