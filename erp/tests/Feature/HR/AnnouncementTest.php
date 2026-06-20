<?php

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\HR\Models\HrAnnouncement;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'AnnCorp', 'slug' => 'ann-' . uniqid()]);
    $this->admin  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->admin->assignRole('super-admin');
    $this->staff  = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->staff->assignRole('staff');
    $this->actingAs($this->admin);
    app()->instance('tenant', $this->tenant);
});

function makeAnnouncement(array $attrs = []): HrAnnouncement
{
    return HrAnnouncement::create([
        'tenant_id'       => test()->tenant->id,
        'title'           => 'Test Announcement',
        'body'            => 'This is a test announcement body.',
        'target_audience' => 'all',
        'is_published'    => false,
        'priority'        => 'normal',
        'created_by'      => test()->admin->id,
        ...$attrs,
    ]);
}

it('index requires auth', function () {
    $this->post('/logout');
    $this->get('/hr/announcements')->assertRedirect('/login');
});

it('admin can list announcements', function () {
    $this->get('/hr/announcements')->assertStatus(200);
});

it('staff with hr.view can list announcements', function () {
    $this->actingAs($this->staff)
        ->get('/hr/announcements')
        ->assertStatus(200);
});

it('store creates an announcement with created_by set', function () {
    $this->post('/hr/announcements', [
        'title'    => 'Company BBQ',
        'body'     => 'Join us for a company BBQ on Friday.',
        'priority' => 'normal',
    ])->assertRedirect();

    $announcement = HrAnnouncement::where('title', 'Company BBQ')->first();
    expect($announcement)->not->toBeNull();
    expect($announcement->created_by)->toBe($this->admin->id);
    expect($announcement->tenant_id)->toBe($this->tenant->id);
});

it('store validates required fields', function () {
    $this->postJson('/hr/announcements', ['title' => '', 'body' => ''])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['title', 'body']);
});

it('show displays announcement details', function () {
    $announcement = makeAnnouncement();
    $this->get("/hr/announcements/{$announcement->id}")->assertStatus(200);
});

it('publish marks announcement as published', function () {
    $announcement = makeAnnouncement(['is_published' => false]);
    $this->post("/hr/announcements/{$announcement->id}/publish")->assertRedirect();
    expect($announcement->fresh()->is_published)->toBeTrue();
    expect($announcement->fresh()->publish_at)->not->toBeNull();
});

it('archive marks announcement as unpublished and sets expire_at', function () {
    $announcement = makeAnnouncement(['is_published' => true]);
    $this->post("/hr/announcements/{$announcement->id}/archive")->assertRedirect();
    expect($announcement->fresh()->is_published)->toBeFalse();
    expect($announcement->fresh()->expire_at)->not->toBeNull();
});

it('is_active returns false for unpublished announcement', function () {
    $announcement = makeAnnouncement(['is_published' => false]);
    expect($announcement->is_active)->toBeFalse();
});

it('destroy soft-deletes the announcement', function () {
    $announcement = makeAnnouncement();
    $this->delete("/hr/announcements/{$announcement->id}")->assertRedirect();
    expect(HrAnnouncement::find($announcement->id))->toBeNull();
    expect(HrAnnouncement::withTrashed()->find($announcement->id))->not->toBeNull();
});
