<?php

namespace App\Modules\Marketing\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Marketing\Models\EmailCampaign;
use App\Modules\Marketing\Models\Subscriber;
use Inertia\Inertia;
use Inertia\Response;

class MarketingDashboardController extends Controller
{
    public function index(): Response
    {
        $totalSubscribers  = Subscriber::count();
        $activeSubscribers = Subscriber::where('status', 'subscribed')->count();
        $totalCampaigns    = EmailCampaign::count();

        $campaignsSentThisMonth = EmailCampaign::where('status', 'sent')
            ->whereYear('sent_at', now()->year)
            ->whereMonth('sent_at', now()->month)
            ->count();

        $sentCampaigns = EmailCampaign::where('status', 'sent')
            ->where('sent_count', '>', 0)
            ->get();

        $avgOpenRate  = $sentCampaigns->count() > 0
            ? round($sentCampaigns->avg(fn ($c) => $c->openRate()), 1)
            : 0;

        $avgClickRate = $sentCampaigns->count() > 0
            ? round($sentCampaigns->avg(fn ($c) => $c->clickRate()), 1)
            : 0;

        $recentCampaigns = EmailCampaign::with('mailingList')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn ($c) => [
                'id'            => $c->id,
                'name'          => $c->name,
                'subject'       => $c->subject,
                'status'        => $c->status,
                'list_name'     => $c->mailingList?->name,
                'total_recipients' => $c->total_recipients,
                'open_rate'     => $c->openRate(),
                'click_rate'    => $c->clickRate(),
                'sent_at'       => $c->sent_at?->toDateTimeString(),
            ]);

        return Inertia::render('Marketing/Dashboard', [
            'stats' => [
                'totalSubscribers'       => $totalSubscribers,
                'activeSubscribers'      => $activeSubscribers,
                'totalCampaigns'         => $totalCampaigns,
                'campaignsSentThisMonth' => $campaignsSentThisMonth,
                'avgOpenRate'            => $avgOpenRate,
                'avgClickRate'           => $avgClickRate,
            ],
            'recentCampaigns' => $recentCampaigns,
        ]);
    }
}
