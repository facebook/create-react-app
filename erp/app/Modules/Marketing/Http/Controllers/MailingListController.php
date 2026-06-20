<?php

namespace App\Modules\Marketing\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Marketing\Models\MailingList;
use App\Modules\Marketing\Models\Subscriber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MailingListController extends Controller
{
    public function index(): Response
    {
        $lists = MailingList::withCount('subscribers')
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Marketing/MailingLists/Index', [
            'lists' => $lists,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Marketing/MailingLists/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);

        $data['tenant_id'] = auth()->user()->tenant_id;

        MailingList::create($data);

        return redirect()->route('marketing.mailing-lists.index')
            ->with('success', 'Mailing list created.');
    }

    public function show(MailingList $mailingList): Response
    {
        $subscribers = $mailingList->subscribers()
            ->orderByDesc('mailing_list_subscriber.mailing_list_id')
            ->paginate(25);

        return Inertia::render('Marketing/MailingLists/Show', [
            'list'        => $mailingList,
            'subscribers' => $subscribers,
        ]);
    }

    public function edit(MailingList $mailingList): Response
    {
        return Inertia::render('Marketing/MailingLists/Edit', [
            'list' => $mailingList,
        ]);
    }

    public function update(Request $request, MailingList $mailingList): RedirectResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);

        $mailingList->update($data);

        return redirect()->route('marketing.mailing-lists.index')
            ->with('success', 'Mailing list updated.');
    }

    public function destroy(MailingList $mailingList): RedirectResponse
    {
        $mailingList->delete();

        return redirect()->route('marketing.mailing-lists.index')
            ->with('success', 'Mailing list deleted.');
    }

    public function addSubscriber(Request $request, MailingList $mailingList): RedirectResponse
    {
        $data = $request->validate([
            'email' => 'required|email',
            'name'  => 'nullable|string|max:255',
        ]);

        $tenantId = auth()->user()->tenant_id;

        $subscriber = Subscriber::firstOrCreate(
            ['tenant_id' => $tenantId, 'email' => $data['email']],
            [
                'name'          => $data['name'] ?? null,
                'status'        => 'subscribed',
                'subscribed_at' => now(),
            ]
        );

        $mailingList->subscribers()->syncWithoutDetaching([$subscriber->id]);

        return redirect()->back()->with('success', 'Subscriber added.');
    }

    public function removeSubscriber(MailingList $mailingList, Subscriber $subscriber): RedirectResponse
    {
        $mailingList->subscribers()->detach($subscriber->id);

        return redirect()->back()->with('success', 'Subscriber removed.');
    }
}
