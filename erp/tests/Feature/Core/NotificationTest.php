<?php

use App\Models\User;
use App\Modules\Core\Models\NotificationInbox;
use App\Modules\Core\Models\NotificationRule;
use App\Modules\Core\Models\Tenant;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Notif Co', 'slug' => 'notif-co']);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

it('user can list their notifications', function () {
    $this->get('/notifications')->assertStatus(200);
});

it('user can list notification rules', function () {
    $this->get('/notification-rules')->assertStatus(200);
});

it('user can create notification rule', function () {
    $this->post('/notification-rules', [
        'name'       => 'Invoice Overdue Alert',
        'event_type' => 'invoice.overdue',
    ])->assertRedirect();
    expect(NotificationRule::where('name', 'Invoice Overdue Alert')->exists())->toBeTrue();
});

it('NotificationInbox::send creates a notification', function () {
    NotificationInbox::send(
        test()->tenant->id,
        test()->admin->id,
        'Test Notification',
        'test.event',
        'This is a test',
        '/dashboard'
    );
    expect(NotificationInbox::where('user_id', test()->admin->id)->exists())->toBeTrue();
});

it('notification is unread by default', function () {
    $notif = NotificationInbox::send(test()->tenant->id, test()->admin->id, 'Hello', 'test', null, null);
    expect($notif->is_read)->toBeFalse();
});

it('user can mark notification as read', function () {
    $notif = NotificationInbox::send(test()->tenant->id, test()->admin->id, 'Hello', 'test', null, null);
    $this->patch("/notifications/{$notif->id}/read");
    expect($notif->fresh()->is_read)->toBeTrue();
    expect($notif->fresh()->read_at)->not->toBeNull();
});

it('user can mark all notifications as read', function () {
    NotificationInbox::send(test()->tenant->id, test()->admin->id, 'A', 'test', null, null);
    NotificationInbox::send(test()->tenant->id, test()->admin->id, 'B', 'test', null, null);
    $this->post('/notifications/mark-all-read');
    expect(NotificationInbox::where('user_id', test()->admin->id)->where('is_read', false)->count())->toBe(0);
});

it('user can delete notification', function () {
    $notif = NotificationInbox::send(test()->tenant->id, test()->admin->id, 'Bye', 'test', null, null);
    $this->delete("/notifications/{$notif->id}")->assertRedirect();
    expect(NotificationInbox::find($notif->id))->toBeNull();
});

it('user can toggle notification rule', function () {
    $rule = NotificationRule::create([
        'tenant_id'  => test()->tenant->id,
        'user_id'    => test()->admin->id,
        'name'       => 'Toggle Me',
        'event_type' => 'test.event',
        'is_active'  => true,
    ]);
    $this->patch("/notification-rules/{$rule->id}/toggle");
    expect($rule->fresh()->is_active)->toBeFalse();
});

it('user can delete notification rule', function () {
    $rule = NotificationRule::create([
        'tenant_id'  => test()->tenant->id,
        'user_id'    => test()->admin->id,
        'name'       => 'Delete Me',
        'event_type' => 'test.event',
        'is_active'  => true,
    ]);
    $this->delete("/notification-rules/{$rule->id}")->assertRedirect();
    expect(NotificationRule::find($rule->id))->toBeNull();
});
