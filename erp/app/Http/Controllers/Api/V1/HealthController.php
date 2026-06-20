<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;

class HealthController extends ApiController
{
    public function check(): JsonResponse
    {
        $checks  = [];
        $overall = 'healthy';

        // Database
        try {
            DB::select('SELECT 1');
            $checks['database'] = ['status' => 'healthy'];
        } catch (\Throwable $e) {
            $checks['database'] = ['status' => 'unhealthy', 'error' => $e->getMessage()];
            $overall = 'unhealthy';
        }

        // Cache
        try {
            Cache::put('health_check', true, 5);
            $checks['cache'] = Cache::get('health_check') === true
                ? ['status' => 'healthy']
                : ['status' => 'degraded', 'error' => 'Cache write/read mismatch'];
            if ($checks['cache']['status'] !== 'healthy') {
                $overall = 'degraded';
            }
        } catch (\Throwable $e) {
            $checks['cache'] = ['status' => 'degraded', 'error' => $e->getMessage()];
            $overall = 'degraded';
        }

        // Queue
        try {
            $failedJobs = DB::table('failed_jobs')->count();
            $checks['queue'] = [
                'status'      => 'healthy',
                'failed_jobs' => $failedJobs,
            ];
            if ($failedJobs > 100) {
                $checks['queue']['status'] = 'degraded';
                $overall = 'degraded';
            }
        } catch (\Throwable $e) {
            $checks['queue'] = ['status' => 'degraded', 'error' => $e->getMessage()];
        }

        // Storage
        try {
            $diskUsage = disk_free_space(storage_path());
            $checks['storage'] = [
                'status'     => 'healthy',
                'free_bytes' => $diskUsage,
            ];
        } catch (\Throwable $e) {
            $checks['storage'] = ['status' => 'degraded', 'error' => $e->getMessage()];
        }

        $httpStatus = $overall === 'healthy' ? 200 : 503;

        return response()->json([
            'status'    => $overall,
            'timestamp' => now()->toIso8601String(),
            'version'   => config('app.version', '1.0.0'),
            'checks'    => $checks,
        ], $httpStatus);
    }

    public function metrics(): JsonResponse
    {
        $tenantId = auth()->user()?->tenant_id;

        $stats = [
            'tenants'          => DB::table('tenants')->count(),
            'users'            => DB::table('users')->count(),
            'api_requests_today' => null, // would need request logging table
            'queue_jobs'       => [
                'pending' => DB::table('jobs')->count(),
                'failed'  => DB::table('failed_jobs')->count(),
            ],
            'database'         => [
                'size_mb' => $this->getDatabaseSize(),
            ],
            'memory_usage_mb'  => round(memory_get_usage(true) / 1024 / 1024, 2),
            'peak_memory_mb'   => round(memory_get_peak_usage(true) / 1024 / 1024, 2),
            'php_version'      => PHP_VERSION,
            'laravel_version'  => app()->version(),
        ];

        return $this->success($stats);
    }

    private function getDatabaseSize(): ?float
    {
        try {
            $path = database_path('database.sqlite');
            if (file_exists($path)) {
                return round(filesize($path) / 1024 / 1024, 2);
            }
            return null;
        } catch (\Throwable) {
            return null;
        }
    }
}
