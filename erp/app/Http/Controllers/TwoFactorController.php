<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use PragmaRX\Google2FALaravel\Support\Authenticator;

class TwoFactorController extends Controller
{
    /**
     * Show the 2FA setup page (generate secret, store in session).
     */
    public function setup(Request $request): Response
    {
        $google2fa = app('pragmarx.google2fa');

        // Generate a new secret only if none is in session
        if (! $request->session()->has('2fa_setup_secret')) {
            $secret = $google2fa->generateSecretKey();
            $request->session()->put('2fa_setup_secret', $secret);
        }

        $secret = $request->session()->get('2fa_setup_secret');
        $user   = $request->user();

        $qrCodeUrl = $google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secret
        );

        return Inertia::render('Auth/TwoFactor/Setup', [
            'qrCodeUrl' => $qrCodeUrl,
            'secret'    => $secret,
            'enabled'   => (bool) $user->two_factor_enabled,
        ]);
    }

    /**
     * Enable 2FA after verifying the TOTP code.
     */
    public function enable(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'size:6'],
        ]);

        $secret = $request->session()->get('2fa_setup_secret');

        if (! $secret) {
            return back()->withErrors(['code' => 'Setup session expired. Please try again.']);
        }

        $google2fa = app('pragmarx.google2fa');

        if (! $google2fa->verifyKey($secret, $request->code)) {
            return back()->withErrors(['code' => 'Invalid verification code. Please try again.']);
        }

        // Generate recovery codes
        $recoveryCodes = collect(range(1, 8))->map(fn () => Str::random(10))->all();

        $request->user()->update([
            'two_factor_secret'         => encrypt($secret),
            'two_factor_enabled'        => true,
            'two_factor_recovery_codes' => encrypt(json_encode($recoveryCodes)),
        ]);

        $request->session()->forget('2fa_setup_secret');
        $request->session()->put('2fa_verified', true);

        return redirect()->route('profile.edit')->with('success', 'Two-factor authentication enabled successfully.');
    }

    /**
     * Disable 2FA after verifying the user's password.
     */
    public function disable(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $request->user()->update([
            'two_factor_secret'         => null,
            'two_factor_enabled'        => false,
            'two_factor_recovery_codes' => null,
        ]);

        $request->session()->forget('2fa_verified');

        return redirect()->route('profile.edit')->with('success', 'Two-factor authentication disabled.');
    }

    /**
     * Show the 2FA challenge page (after login, if 2FA enabled).
     */
    public function challenge(Request $request): Response|RedirectResponse
    {
        if (! $request->user()?->two_factor_enabled) {
            return redirect()->route('dashboard');
        }

        if ($request->session()->get('2fa_verified')) {
            return redirect()->intended(route('dashboard'));
        }

        return Inertia::render('Auth/TwoFactor/Challenge');
    }

    /**
     * Verify the TOTP code during login challenge.
     */
    public function verify(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'string'],
        ]);

        $user = $request->user();

        if (! $user?->two_factor_enabled || ! $user->two_factor_secret) {
            return redirect()->route('dashboard');
        }

        $secret    = decrypt($user->two_factor_secret);
        $google2fa = app('pragmarx.google2fa');
        $code      = preg_replace('/\s/', '', $request->code);

        // Try TOTP first
        if (strlen($code) === 6 && $google2fa->verifyKey($secret, $code)) {
            $request->session()->put('2fa_verified', true);
            return redirect()->intended(route('dashboard'));
        }

        // Try recovery codes
        if (strlen($code) === 10 && $user->two_factor_recovery_codes) {
            $recoveryCodes = json_decode(decrypt($user->two_factor_recovery_codes), true) ?? [];
            if (in_array($code, $recoveryCodes, true)) {
                // Remove used recovery code
                $remaining = array_values(array_filter($recoveryCodes, fn ($c) => $c !== $code));
                $user->update(['two_factor_recovery_codes' => encrypt(json_encode($remaining))]);

                $request->session()->put('2fa_verified', true);
                return redirect()->intended(route('dashboard'));
            }
        }

        return back()->withErrors(['code' => 'Invalid code. Please try again.']);
    }
}
