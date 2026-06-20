<?php

namespace App\Modules\Marketing\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Marketing\Models\EmailCampaign;
use App\Modules\Marketing\Models\MailingList;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmailCampaignController extends Controller
{
    public function index(): Response
    {
        $campaigns = EmailCampaign::with('mailingList')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($c) => [
                'id'               => $c->id,
                'name'             => $c->name,
                'subject'          => $c->subject,
                'status'           => $c->status,
                'list_name'        => $c->mailingList?->name,
                'total_recipients' => $c->total_recipients,
                'open_rate'        => $c->openRate(),
                'click_rate'       => $c->clickRate(),
                'sent_at'          => $c->sent_at?->toDateTimeString(),
            ]);

        return Inertia::render('Marketing/Campaigns/Index', [
            'campaigns' => $campaigns,
        ]);
    }

    public function create(): Response
    {
        $mailingLists = MailingList::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Marketing/Campaigns/Create', [
            'mailingLists' => $mailingLists,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'            => 'required|string|max:255',
            'subject'         => 'required|string|max:255',
            'preview_text'    => 'nullable|string|max:255',
            'body_html'       => 'required|string',
            'body_text'       => 'nullable|string',
            'from_name'       => 'nullable|string|max:255',
            'from_email'      => 'nullable|email',
            'mailing_list_id' => 'nullable|exists:mailing_lists,id',
            'scheduled_at'    => 'nullable|date',
        ]);

        $data['tenant_id']  = auth()->user()->tenant_id;
        $data['created_by'] = auth()->id();

        $campaign = EmailCampaign::create($data);

        return redirect()->route('marketing.campaigns.show', $campaign)
            ->with('success', 'Campaign created.');
    }

    public function show(EmailCampaign $campaign): Response
    {
        $sends = $campaign->sends()
            ->with('subscriber')
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        return Inertia::render('Marketing/Campaigns/Show', [
            'campaign' => array_merge($campaign->toArray(), [
                'open_rate'  => $campaign->openRate(),
                'click_rate' => $campaign->clickRate(),
                'list_name'  => $campaign->mailingList?->name,
            ]),
            'sends' => $sends,
        ]);
    }

    public function edit(EmailCampaign $campaign): Response
    {
        $mailingLists = MailingList::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Marketing/Campaigns/Edit', [
            'campaign'     => $campaign,
            'mailingLists' => $mailingLists,
        ]);
    }

    public function update(Request $request, EmailCampaign $campaign): RedirectResponse
    {
        if ($campaign->status !== 'draft') {
            return redirect()->back()->with('error', 'Only draft campaigns can be edited.');
        }

        $data = $request->validate([
            'name'            => 'required|string|max:255',
            'subject'         => 'required|string|max:255',
            'preview_text'    => 'nullable|string|max:255',
            'body_html'       => 'required|string',
            'body_text'       => 'nullable|string',
            'from_name'       => 'nullable|string|max:255',
            'from_email'      => 'nullable|email',
            'mailing_list_id' => 'nullable|exists:mailing_lists,id',
            'scheduled_at'    => 'nullable|date',
        ]);

        $campaign->update($data);

        return redirect()->route('marketing.campaigns.show', $campaign)
            ->with('success', 'Campaign updated.');
    }

    public function destroy(EmailCampaign $campaign): RedirectResponse
    {
        if (!in_array($campaign->status, ['draft', 'cancelled'])) {
            return redirect()->back()->with('error', 'Only draft or cancelled campaigns can be deleted.');
        }

        $campaign->delete();

        return redirect()->route('marketing.campaigns.index')
            ->with('success', 'Campaign deleted.');
    }

    public function send(EmailCampaign $campaign): RedirectResponse
    {
        $campaign->send();

        return redirect()->route('marketing.campaigns.show', $campaign)
            ->with('success', 'Campaign sent successfully.');
    }

    public function cancel(EmailCampaign $campaign): RedirectResponse
    {
        $campaign->cancel();

        return redirect()->route('marketing.campaigns.show', $campaign)
            ->with('success', 'Campaign cancelled.');
    }
}
