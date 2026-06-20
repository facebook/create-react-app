<?php

namespace Database\Seeders;

use App\Models\User;
use App\Modules\Core\Models\Tenant;
use App\Modules\Discuss\Models\DiscussChannel;
use App\Modules\Discuss\Models\DiscussMessage;
use Illuminate\Database\Seeder;

class DiscussSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();

        if (! $tenant) {
            return;
        }

        $user = User::where('tenant_id', $tenant->id)->first();

        if (! $user) {
            return;
        }

        // Channels
        $general = DiscussChannel::create([
            'tenant_id'   => $tenant->id,
            'name'        => 'General',
            'slug'        => 'general',
            'description' => 'Company-wide announcements and discussions',
            'type'        => 'public',
            'is_archived' => false,
            'created_by'  => $user->id,
        ]);

        $sales = DiscussChannel::create([
            'tenant_id'   => $tenant->id,
            'name'        => 'Sales Team',
            'slug'        => 'sales-team',
            'description' => 'Internal channel for the sales department',
            'type'        => 'private',
            'is_archived' => false,
            'created_by'  => $user->id,
        ]);

        // Messages in General channel
        DiscussMessage::create([
            'tenant_id'  => $tenant->id,
            'channel_id' => $general->id,
            'user_id'    => $user->id,
            'body'       => 'Welcome to the General channel! Use this space for company-wide updates.',
        ]);

        DiscussMessage::create([
            'tenant_id'  => $tenant->id,
            'channel_id' => $general->id,
            'user_id'    => $user->id,
            'body'       => 'Reminder: the Q3 planning meeting is scheduled for next Monday at 10:00 AM.',
        ]);

        DiscussMessage::create([
            'tenant_id'  => $tenant->id,
            'channel_id' => $general->id,
            'user_id'    => $user->id,
            'body'       => 'Great work everyone on hitting the June targets! Keep up the momentum.',
        ]);
    }
}
