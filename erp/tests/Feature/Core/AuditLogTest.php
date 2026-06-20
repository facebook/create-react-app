<?php

use App\Models\User;
use App\Modules\Core\Models\AuditLog;
use Illuminate\Support\Facades\Hash;

test('audit log is created when a user is created', function () {
    expect(AuditLog::count())->toBe(0);

    User::factory()->create(['name' => 'Alice']);

    expect(AuditLog::where('event', 'created')->count())->toBe(1);

    $log = AuditLog::first();
    expect($log->auditable_type)->toBe(User::class);
    expect($log->new_values)->toHaveKey('name');
    expect($log->new_values['name'])->toBe('Alice');
    expect($log->old_values)->toBeNull();
});

test('audit log is created when a user is updated', function () {
    $user = User::factory()->create(['name' => 'Bob']);
    AuditLog::query()->delete();

    $user->update(['name' => 'Bobby']);

    $log = AuditLog::where('event', 'updated')->first();
    expect($log)->not->toBeNull();
    expect($log->old_values['name'])->toBe('Bob');
    expect($log->new_values['name'])->toBe('Bobby');
});

test('audit log is created when a user is deleted', function () {
    $user = User::factory()->create();
    AuditLog::query()->delete();

    $user->delete();

    expect(AuditLog::where('event', 'deleted')->count())->toBe(1);
    $log = AuditLog::where('event', 'deleted')->first();
    expect($log->old_values)->toHaveKey('email');
    expect($log->new_values)->toBeNull();
});

test('audit log records the acting user', function () {
    $actor = User::factory()->create();
    AuditLog::query()->delete();

    $this->actingAs($actor);

    $target = User::factory()->create(['name' => 'Target User']);

    $log = AuditLog::where('event', 'created')
        ->where('auditable_type', User::class)
        ->where('auditable_id', $target->id)
        ->first();

    expect($log?->user_id)->toBe($actor->id);
});

test('audit log does not track password in plain text', function () {
    $user = User::factory()->create();
    $log  = AuditLog::where('event', 'created')->first();

    // Password is hashed, so new_values should not contain raw password string 'password'
    $newValues = $log->new_values ?? [];
    if (isset($newValues['password'])) {
        expect($newValues['password'])->not->toBe('password');
        expect(Hash::check('password', $newValues['password']))->toBeTrue();
    }
});
