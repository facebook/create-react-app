<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\Hash;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => '2FA Co', 'slug' => '2fa-co-' . uniqid()]);
    $this->user   = User::factory()->create([
        'tenant_id' => $this->tenant->id,
        'password'  => Hash::make('password123'),
    ]);
    $this->user->assignRole('staff');
});

test('setup page renders for authenticated user', function () {
    $this->actingAs($this->user)
        ->get('/2fa/setup')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p
            ->component('Auth/TwoFactor/Setup')
            ->has('qrCodeUrl')
            ->has('secret')
            ->has('enabled')
        );
});

test('setup page requires authentication', function () {
    $this->get('/2fa/setup')
        ->assertRedirect('/login');
});

test('enable 2fa stores secret on user', function () {
    $google2fa = app('pragmarx.google2fa');
    $secret    = $google2fa->generateSecretKey();

    $this->actingAs($this->user)
        ->withSession(['2fa_setup_secret' => $secret]);

    $code = $google2fa->getCurrentOtp($secret);

    $this->actingAs($this->user)
        ->withSession(['2fa_setup_secret' => $secret])
        ->post('/2fa/enable', ['code' => $code])
        ->assertRedirect('/profile');

    $this->user->refresh();
    expect($this->user->two_factor_enabled)->toBeTrue();
    expect($this->user->two_factor_secret)->not->toBeNull();
    expect($this->user->two_factor_recovery_codes)->not->toBeNull();
});

test('enable 2fa fails with invalid code', function () {
    $google2fa = app('pragmarx.google2fa');
    $secret    = $google2fa->generateSecretKey();

    $this->actingAs($this->user)
        ->withSession(['2fa_setup_secret' => $secret])
        ->post('/2fa/enable', ['code' => '000000'])
        ->assertSessionHasErrors('code');
});

test('disable 2fa clears secret', function () {
    $google2fa = app('pragmarx.google2fa');
    $secret    = $google2fa->generateSecretKey();

    $this->user->update([
        'two_factor_secret'         => encrypt($secret),
        'two_factor_enabled'        => true,
        'two_factor_recovery_codes' => encrypt(json_encode(['AAAAAAAAAA'])),
    ]);

    $this->actingAs($this->user)
        ->withSession(['2fa_verified' => true])
        ->post('/2fa/disable', ['password' => 'password123'])
        ->assertRedirect('/profile');

    $this->user->refresh();
    expect($this->user->two_factor_enabled)->toBeFalse();
    expect($this->user->two_factor_secret)->toBeNull();
    expect($this->user->two_factor_recovery_codes)->toBeNull();
});

test('disable 2fa fails with wrong password', function () {
    $this->user->update(['two_factor_enabled' => true]);

    $this->actingAs($this->user)
        ->post('/2fa/disable', ['password' => 'wrongpassword'])
        ->assertSessionHasErrors('password');
});

test('challenge page renders for user with 2fa enabled', function () {
    $google2fa = app('pragmarx.google2fa');
    $secret    = $google2fa->generateSecretKey();

    $this->user->update([
        'two_factor_secret'  => encrypt($secret),
        'two_factor_enabled' => true,
    ]);

    $this->actingAs($this->user)
        ->get('/2fa/challenge')
        ->assertStatus(200)
        ->assertInertia(fn ($p) => $p->component('Auth/TwoFactor/Challenge'));
});

test('valid code passes challenge verification', function () {
    $google2fa = app('pragmarx.google2fa');
    $secret    = $google2fa->generateSecretKey();

    $this->user->update([
        'two_factor_secret'  => encrypt($secret),
        'two_factor_enabled' => true,
    ]);

    $code = $google2fa->getCurrentOtp($secret);

    $this->actingAs($this->user)
        ->post('/2fa/verify', ['code' => $code])
        ->assertRedirect();

    expect(session('2fa_verified'))->toBeTrue();
});

test('invalid code fails challenge verification', function () {
    $google2fa = app('pragmarx.google2fa');
    $secret    = $google2fa->generateSecretKey();

    $this->user->update([
        'two_factor_secret'  => encrypt($secret),
        'two_factor_enabled' => true,
    ]);

    $this->actingAs($this->user)
        ->post('/2fa/verify', ['code' => '000000'])
        ->assertSessionHasErrors('code');
});
