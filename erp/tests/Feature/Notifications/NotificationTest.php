<?php

use App\Models\User;
use App\Modules\Core\Models\ErpNotification;
use App\Modules\Core\Models\Tenant;
use App\Services\NotificationService;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\Event;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Notif Co', 'slug' => 'notif-co']);
    $this->user = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});

it('can create a notification', function () {
    Event::fake();
    $notification = NotificationService::send(
        $this->tenant->id, $this->user->id,
        'test', 'Test Title', 'Test message'
    );

    expect($notification->id)->not->toBeNull();
    expect(ErpNotification::count())->toBe(1);
});

it('returns notifications via api', function () {
    ErpNotification::create([
        'tenant_id' => $this->tenant->id,
        'user_id'   => $this->user->id,
        'type'      => 'test',
        'title'     => 'Test',
        'message'   => 'Test message',
    ]);

    $response = $this->withToken($this->token)->getJson('/api/v1/notifications');
    $response->assertStatus(200);
    expect($response->json('data'))->not->toBeEmpty();
});

it('returns unread count', function () {
    ErpNotification::create([
        'tenant_id' => $this->tenant->id,
        'user_id'   => $this->user->id,
        'type'      => 'test',
        'title'     => 'Unread',
        'message'   => 'Unread message',
    ]);

    $response = $this->withToken($this->token)->getJson('/api/v1/notifications/unread-count');
    $response->assertStatus(200);
    expect($response->json('data.count'))->toBe(1);
});

it('can mark a notification as read', function () {
    $notification = ErpNotification::create([
        'tenant_id' => $this->tenant->id,
        'user_id'   => $this->user->id,
        'type'      => 'test',
        'title'     => 'To Read',
        'message'   => 'Mark me as read',
    ]);

    $response = $this->withToken($this->token)->postJson("/api/v1/notifications/{$notification->id}/read");
    $response->assertStatus(200);
    expect($notification->fresh()->read_at)->not->toBeNull();
});

it('can mark all notifications as read', function () {
    for ($i = 0; $i < 3; $i++) {
        ErpNotification::create([
            'tenant_id' => $this->tenant->id,
            'user_id'   => $this->user->id,
            'type'      => 'test',
            'title'     => "Notification $i",
            'message'   => "Message $i",
        ]);
    }

    $response = $this->withToken($this->token)->postJson('/api/v1/notifications/mark-all-read');
    $response->assertStatus(200);
    expect(ErpNotification::where('user_id', $this->user->id)->whereNull('read_at')->count())->toBe(0);
});
