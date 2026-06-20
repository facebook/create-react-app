<?php

namespace Database\Seeders;

use App\Modules\Core\Models\Tenant;
use App\Modules\LiveChat\Models\ChatChannel;
use App\Modules\LiveChat\Models\ChatSession;
use Illuminate\Database\Seeder;

class LiveChatSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();

        if (! $tenant) {
            return;
        }

        $userId = \App\Models\User::first()->id ?? 1;

        $channel = ChatChannel::create([
            'tenant_id'       => $tenant->id,
            'name'            => 'Website Support Chat',
            'widget_color'    => '#4F46E5',
            'welcome_message' => 'Hi there! How can we help you today?',
            'offline_message' => 'We\'re currently offline. Please leave a message and we\'ll get back to you shortly.',
            'is_active'       => true,
            'assigned_agents' => [$userId],
        ]);

        ChatSession::create([
            'tenant_id'         => $tenant->id,
            'channel_id'        => $channel->id,
            'visitor_name'      => 'Emily Clarke',
            'visitor_email'     => 'emily.clarke@prospect.example',
            'source_url'        => 'https://www.example.com/pricing',
            'status'            => 'resolved',
            'assigned_agent_id' => $userId,
            'rating'            => 5,
            'rating_note'       => 'Very helpful and quick response!',
            'started_at'        => now()->subHours(3),
            'ended_at'          => now()->subHours(2)->subMinutes(30),
            'last_message_at'   => now()->subHours(2)->subMinutes(32),
        ]);

        ChatSession::create([
            'tenant_id'       => $tenant->id,
            'channel_id'      => $channel->id,
            'visitor_name'    => 'Marcus Tan',
            'visitor_email'   => 'marcus.tan@company.example',
            'source_url'      => 'https://www.example.com/contact',
            'status'          => 'open',
            'started_at'      => now()->subMinutes(10),
            'last_message_at' => now()->subMinutes(8),
        ]);
    }
}
