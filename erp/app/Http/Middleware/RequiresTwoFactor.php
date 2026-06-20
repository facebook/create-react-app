<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequiresTwoFactor
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (
            $user
            && $user->two_factor_enabled
            && ! $request->session()->get('2fa_verified')
            && ! $request->routeIs('2fa.*')
            && ! $request->routeIs('logout')
        ) {
            return redirect()->route('2fa.challenge');
        }

        return $next($request);
    }
}
