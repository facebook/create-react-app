<?php

namespace App\Modules\Discuss\Http\Controllers;

use App\Events\Discuss\NewDiscussMessage;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Discuss\Models\DiscussChannel;
use App\Modules\Discuss\Models\DiscussMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DiscussController extends Controller
{
    public function index(Request $request): Response
    {
        $userId = auth()->id();
        $channels = DiscussChannel::where('is_archived', false)
            ->where(function ($q) use ($userId) {
                $q->where('type', 'public')
                  ->orWhereHas('members', fn ($m) => $m->where('user_id', $userId));
            })
            ->with(['creator'])
            ->withCount('messages')
            ->latest()
            ->get()
            ->map(fn ($ch) => [
                'id'            => $ch->id,
                'name'          => $ch->name,
                'type'          => $ch->type,
                'description'   => $ch->description,
                'messages_count' => $ch->messages_count,
                'unread_count'  => $ch->getUnreadCountFor($userId),
                'created_by'    => $ch->creator?->name,
            ]);

        return Inertia::render('Discuss/Index', ['channels' => $channels]);
    }

    public function show(DiscussChannel $channel, Request $request): Response
    {
        $channel->markReadFor(auth()->id());

        $messages = $channel->messages()
            ->with(['user', 'replies.user'])
            ->whereNull('parent_id')
            ->latest()
            ->take(50)
            ->get()
            ->reverse()
            ->values()
            ->map(fn ($m) => [
                'id'         => $m->id,
                'body'       => $m->body,
                'is_edited'  => $m->is_edited,
                'is_pinned'  => $m->is_pinned,
                'created_at' => $m->created_at,
                'user'       => ['id' => $m->user->id, 'name' => $m->user->name],
                'replies_count' => $m->replies()->count(),
            ]);

        $members = $channel->members()->get()->map(fn ($u) => [
            'id'   => $u->id,
            'name' => $u->name,
        ]);

        return Inertia::render('Discuss/Show', [
            'channel'  => [
                'id'          => $channel->id,
                'name'        => $channel->name,
                'type'        => $channel->type,
                'description' => $channel->description,
            ],
            'messages' => $messages,
            'members'  => $members,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'type'        => 'required|in:public,private',
            'member_ids'  => 'nullable|array',
            'member_ids.*' => 'exists:users,id',
        ]);

        $channel = DiscussChannel::createPublic(
            auth()->user()->tenant_id,
            auth()->id(),
            $data['name'],
            $data['description'] ?? null,
        );

        if ($channel->type !== 'public' || !empty($data['member_ids'])) {
            foreach ($data['member_ids'] ?? [] as $uid) {
                if ((int) $uid !== auth()->id()) {
                    $channel->members()->syncWithoutDetaching([(int) $uid => ['last_read_at' => now()]]);
                }
            }
        }

        return redirect()->route('discuss.show', $channel)->with('success', 'Channel created.');
    }

    public function sendMessage(Request $request, DiscussChannel $channel): JsonResponse
    {
        $data = $request->validate([
            'body'      => 'required|string|max:4000',
            'parent_id' => 'nullable|exists:discuss_messages,id',
        ]);

        $message = DiscussMessage::create([
            'tenant_id'  => auth()->user()->tenant_id,
            'channel_id' => $channel->id,
            'user_id'    => auth()->id(),
            'body'       => $data['body'],
            'parent_id'  => $data['parent_id'] ?? null,
        ]);

        $message->load('user');

        broadcast(new NewDiscussMessage($message))->toOthers();

        return response()->json([
            'id'         => $message->id,
            'body'       => $message->body,
            'is_edited'  => false,
            'is_pinned'  => false,
            'created_at' => $message->created_at,
            'user'       => ['id' => $message->user->id, 'name' => $message->user->name],
            'replies_count' => 0,
        ], 201);
    }

    public function editMessage(Request $request, DiscussChannel $channel, DiscussMessage $message): JsonResponse
    {
        abort_if($message->user_id !== auth()->id(), 403);
        $data = $request->validate(['body' => 'required|string|max:4000']);
        $message->edit($data['body']);
        return response()->json(['ok' => true]);
    }

    public function deleteMessage(DiscussChannel $channel, DiscussMessage $message): JsonResponse
    {
        abort_if($message->user_id !== auth()->id() && auth()->user()->cannot('manage-discuss'), 403);
        $message->delete();
        return response()->json(['ok' => true]);
    }

    public function joinChannel(DiscussChannel $channel): RedirectResponse
    {
        $channel->members()->syncWithoutDetaching([auth()->id() => ['last_read_at' => now()]]);
        return redirect()->route('discuss.show', $channel)->with('success', 'Joined channel.');
    }

    public function leaveChannel(DiscussChannel $channel): RedirectResponse
    {
        $channel->members()->detach(auth()->id());
        return redirect()->route('discuss.index')->with('success', 'Left channel.');
    }

    public function users(): JsonResponse
    {
        $users = User::where('tenant_id', auth()->user()->tenant_id)
            ->orderBy('name')
            ->get(['id', 'name']);
        return response()->json($users);
    }
}
