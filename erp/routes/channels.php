<?php

use App\Modules\LiveChat\Models\ChatSession;
use App\Modules\Discuss\Models\DiscussChannel;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Agent can listen to a LiveChat session in their tenant
Broadcast::channel('chat-session.{sessionId}', function ($user, $sessionId) {
    $session = ChatSession::find($sessionId);
    return $session && $session->tenant_id === $user->tenant_id;
});

// Tenant member can listen to a Discuss channel in their tenant
Broadcast::channel('discuss-channel.{channelId}', function ($user, $channelId) {
    $channel = DiscussChannel::find($channelId);
    return $channel && $channel->tenant_id === $user->tenant_id;
});

// Any authenticated user can receive tenant-wide ERP notifications
Broadcast::channel('tenant.{tenantId}', function ($user, $tenantId) {
    return $user->tenant_id === (int) $tenantId;
});
