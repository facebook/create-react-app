<?php

namespace App\Http\Controllers;

use App\Models\Webhook;
use App\Services\WebhookService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WebhookController extends Controller
{
    public const AVAILABLE_EVENTS = [
        'order.created',
        'invoice.paid',
        'lead.won',
        'ticket.resolved',
        'employee.created',
        'payment.received',
    ];

    public function index(): Response
    {
        $webhooks = Webhook::withoutGlobalScopes()
            ->where('tenant_id', auth()->user()->tenant_id)
            ->withCount('deliveries')
            ->latest()
            ->get();

        return Inertia::render('Settings/Webhooks/Index', [
            'webhooks'        => $webhooks,
            'availableEvents' => self::AVAILABLE_EVENTS,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Settings/Webhooks/Create', [
            'availableEvents' => self::AVAILABLE_EVENTS,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name'      => ['required', 'string', 'max:255'],
            'url'       => ['required', 'url', 'max:2048'],
            'events'    => ['nullable', 'array'],
            'events.*'  => ['string', 'in:' . implode(',', self::AVAILABLE_EVENTS)],
            'secret'    => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
        ]);

        Webhook::create([
            'tenant_id' => auth()->user()->tenant_id,
            'name'      => $request->name,
            'url'       => $request->url,
            'events'    => $request->events ?? [],
            'secret'    => $request->secret,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('webhooks.index')->with('success', 'Webhook created successfully.');
    }

    public function edit(Webhook $webhook): Response
    {
        return Inertia::render('Settings/Webhooks/Edit', [
            'webhook'         => $webhook,
            'availableEvents' => self::AVAILABLE_EVENTS,
        ]);
    }

    public function update(Request $request, Webhook $webhook): RedirectResponse
    {
        $request->validate([
            'name'      => ['required', 'string', 'max:255'],
            'url'       => ['required', 'url', 'max:2048'],
            'events'    => ['nullable', 'array'],
            'events.*'  => ['string', 'in:' . implode(',', self::AVAILABLE_EVENTS)],
            'secret'    => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
        ]);

        $webhook->update([
            'name'      => $request->name,
            'url'       => $request->url,
            'events'    => $request->events ?? [],
            'secret'    => $request->secret,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('webhooks.index')->with('success', 'Webhook updated successfully.');
    }

    public function destroy(Webhook $webhook): RedirectResponse
    {
        $webhook->delete();
        return redirect()->route('webhooks.index')->with('success', 'Webhook deleted.');
    }

    public function deliveries(Webhook $webhook): Response
    {
        $deliveries = $webhook->deliveries()
            ->latest()
            ->limit(50)
            ->get();

        return Inertia::render('Settings/Webhooks/Deliveries', [
            'webhook'    => $webhook,
            'deliveries' => $deliveries,
        ]);
    }

    public function test(Webhook $webhook): RedirectResponse
    {
        WebhookService::send($webhook, 'ping', [
            'event'     => 'ping',
            'message'   => 'This is a test webhook delivery.',
            'timestamp' => now()->toIso8601String(),
        ]);

        return back()->with('success', 'Test ping sent to webhook.');
    }
}
