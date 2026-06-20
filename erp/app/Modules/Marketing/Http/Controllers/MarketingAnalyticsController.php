<?php

namespace App\Modules\Marketing\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Marketing\Models\AbTestVariant;
use App\Modules\Marketing\Models\CampaignEvent;
use App\Modules\Marketing\Models\EmailCampaign;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MarketingAnalyticsController extends Controller
{
    public function index(): Response
    {
        $tenantId = app('tenant')->id;
        $campaigns = EmailCampaign::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->withCount(['events as sent_count' => fn ($q) => $q->where('event_type', 'sent')])
            ->withCount(['events as open_count' => fn ($q) => $q->where('event_type', 'opened')])
            ->withCount(['events as click_count' => fn ($q) => $q->where('event_type', 'clicked')])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($c) => [
                'id'         => $c->id,
                'name'       => $c->name,
                'status'     => $c->status ?? 'draft',
                'sent'       => $c->sent_count,
                'opens'      => $c->open_count,
                'clicks'     => $c->click_count,
                'open_rate'  => $c->sent_count > 0 ? round($c->open_count / $c->sent_count * 100, 1) : 0,
                'click_rate' => $c->sent_count > 0 ? round($c->click_count / $c->sent_count * 100, 1) : 0,
            ]);

        return Inertia::render('Marketing/Analytics/Index', ['campaigns' => $campaigns]);
    }

    public function campaignStats(EmailCampaign $campaign): JsonResponse
    {
        $tenantId = app('tenant')->id;
        $events = CampaignEvent::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->where('campaign_id', $campaign->id)
            ->selectRaw('event_type, COUNT(*) as count')
            ->groupBy('event_type')
            ->pluck('count', 'event_type');

        $sent = (int) ($events['sent'] ?? 0);
        return response()->json([
            'campaign_id' => $campaign->id,
            'stats' => [
                'sent'         => $sent,
                'opened'       => (int) ($events['opened'] ?? 0),
                'clicked'      => (int) ($events['clicked'] ?? 0),
                'bounced'      => (int) ($events['bounced'] ?? 0),
                'unsubscribed' => (int) ($events['unsubscribed'] ?? 0),
                'open_rate'    => $sent > 0 ? round(($events['opened'] ?? 0) / $sent * 100, 1) : 0,
                'click_rate'   => $sent > 0 ? round(($events['clicked'] ?? 0) / $sent * 100, 1) : 0,
            ],
        ]);
    }

    public function trackEvent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'campaign_id'      => 'required|exists:email_campaigns,id',
            'subscriber_email' => 'required|email',
            'event_type'       => 'required|in:sent,opened,clicked,bounced,unsubscribed,complained',
            'metadata'         => 'nullable|array',
        ]);

        $event = CampaignEvent::create([
            'tenant_id'   => auth()->user()->tenant_id,
            'occurred_at' => now(),
        ] + $validated);

        return response()->json(['success' => true, 'event_id' => $event->id]);
    }

    public function storeAbVariant(Request $request, EmailCampaign $campaign): JsonResponse
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:100',
            'subject_line'    => 'nullable|string|max:255',
            'preview_text'    => 'nullable|string|max:255',
            'send_percentage' => 'required|integer|min:1|max:100',
        ]);

        $variant = AbTestVariant::create([
            'tenant_id'   => app('tenant')->id,
            'campaign_id' => $campaign->id,
        ] + $validated);

        return response()->json(['success' => true, 'variant' => $variant]);
    }

    public function declareWinner(EmailCampaign $campaign, AbTestVariant $variant): JsonResponse
    {
        $variant->declareWinner();

        return response()->json(['success' => true]);
    }
}
