<?php

namespace App\Http\Middleware;

use App\Modules\Core\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /** @return array<string, mixed> */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id'       => $user->id,
                    'name'     => $user->name,
                    'email'    => $user->email,
                    'avatar'   => $user->avatar,
                    'initials' => $user->initials,
                    'roles'    => $user->getRoleNames(),
                    'permissions' => $user->getAllPermissions()->pluck('name'),
                ] : null,
                'tenant' => $request->attributes->get('tenant') instanceof Tenant
                    ? [
                        'id'   => $request->attributes->get('tenant')->id,
                        'name' => $request->attributes->get('tenant')->name,
                        'slug' => $request->attributes->get('tenant')->slug,
                    ]
                    : null,
            ],
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
            ],
            'notifications_count' => fn () => $user
                ? $user->unreadNotifications()->count()
                : 0,
            'notifications' => function () use ($user) {
                if (! $user) {
                    return [];
                }
                try {
                    return \App\Services\NotificationService::forUser($user);
                } catch (\Throwable) {
                    return [];
                }
            },
        ];
    }
}
