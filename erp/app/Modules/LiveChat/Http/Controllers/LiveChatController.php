<?php

namespace App\Modules\LiveChat\Http\Controllers;

use App\Events\LiveChat\NewChatMessage;
use App\Http\Controllers\Controller;
use App\Modules\LiveChat\Models\ChatChannel;
use App\Modules\LiveChat\Models\ChatMessage;
use App\Modules\LiveChat\Models\ChatSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LiveChatController extends Controller
{
    public function dashboard(): Response
    {
        $tenantId = app('tenant')->id;
        $today    = now()->startOfDay();

        return Inertia::render('LiveChat/Dashboard', [
            'stats' => [
                'open_sessions'    => ChatSession::withoutGlobalScopes()->where('tenant_id', $tenantId)->where('status', 'open')->count(),
                'assigned_sessions'=> ChatSession::withoutGlobalScopes()->where('tenant_id', $tenantId)->where('status', 'assigned')->count(),
                'resolved_today'   => ChatSession::withoutGlobalScopes()->where('tenant_id', $tenantId)->where('status', 'resolved')->where('ended_at', '>=', $today)->count(),
                'missed_today'     => ChatSession::withoutGlobalScopes()->where('tenant_id', $tenantId)->where('status', 'missed')->where('ended_at', '>=', $today)->count(),
                'channels_count'   => ChatChannel::withoutGlobalScopes()->where('tenant_id', $tenantId)->count(),
                'avg_rating'       => round((float) ChatSession::withoutGlobalScopes()->where('tenant_id', $tenantId)->whereNotNull('rating')->avg('rating'), 1),
            ],
        ]);
    }

    public function channels(): Response
    {
        $channels = ChatChannel::withoutGlobalScopes()
            ->where('tenant_id', app('tenant')->id)
            ->withCount('sessions')
            ->orderBy('name')
            ->get();

        return Inertia::render('LiveChat/Channels/Index', ['channels' => $channels]);
    }

    public function storeChannel(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'widget_color'    => 'nullable|string|max:20',
            'welcome_message' => 'nullable|string',
            'offline_message' => 'nullable|string',
        ]);

        ChatChannel::create(['tenant_id' => app('tenant')->id] + $validated);

        return redirect()->back()->with('success', 'Channel created.');
    }

    public function sessions(): Response
    {
        $status = request('status');

        $query = ChatSession::withoutGlobalScopes()
            ->where('tenant_id', app('tenant')->id)
            ->with(['channel', 'agent'])
            ->orderByDesc('last_message_at');

        if ($status) {
            $query->where('status', $status);
        }

        $sessions = $query->paginate(20);

        return Inertia::render('LiveChat/Sessions/Index', [
            'sessions'       => $sessions,
            'active_status'  => $status,
        ]);
    }

    public function show(ChatSession $session): Response
    {
        $session->load(['messages.agent', 'channel', 'agent']);

        return Inertia::render('LiveChat/Sessions/Show', ['session' => $session]);
    }

    public function assign(Request $request, ChatSession $session): RedirectResponse
    {
        $validated = $request->validate([
            'agent_id' => 'required|exists:users,id',
        ]);

        $session->assign((int) $validated['agent_id']);

        return redirect()->back()->with('success', 'Session assigned.');
    }

    public function resolve(ChatSession $session): RedirectResponse
    {
        $session->resolve();

        return redirect()->back()->with('success', 'Session resolved.');
    }

    public function sendMessage(Request $request, ChatSession $session): RedirectResponse
    {
        $validated = $request->validate([
            'message' => 'required|string',
        ]);

        $msg = ChatMessage::create([
            'tenant_id'   => $session->tenant_id,
            'session_id'  => $session->id,
            'sender_type' => 'agent',
            'agent_id'    => auth()->id(),
            'message'     => $validated['message'],
        ]);

        $session->update(['last_message_at' => now()]);

        broadcast(new NewChatMessage($msg))->toOthers();

        return redirect()->back()->with('success', 'Message sent.');
    }

    public function rate(Request $request, ChatSession $session): RedirectResponse
    {
        $validated = $request->validate([
            'rating'      => 'required|integer|min:1|max:5',
            'rating_note' => 'nullable|string',
        ]);

        $session->update($validated);

        return redirect()->back()->with('success', 'Rating saved.');
    }
}
