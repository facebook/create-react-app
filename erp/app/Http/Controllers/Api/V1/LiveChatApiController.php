<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\LiveChat\Models\ChatChannel;
use App\Modules\LiveChat\Models\ChatMessage;
use App\Modules\LiveChat\Models\ChatSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LiveChatApiController extends ApiController
{
    /**
     * GET /api/v1/live-chat/channels
     */
    public function channels(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $paginator = ChatChannel::where('tenant_id', $tenantId)->latest()->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * GET /api/v1/live-chat/sessions
     */
    public function sessions(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $query = ChatSession::where('tenant_id', $tenantId);

        if ($channelId = $request->query('channel_id')) {
            $query->where('channel_id', $channelId);
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $paginator = $query->latest()->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * GET /api/v1/live-chat/messages
     */
    public function messages(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $query = ChatMessage::where('tenant_id', $tenantId);

        if ($sessionId = $request->query('session_id')) {
            $query->where('session_id', $sessionId);
        }

        $paginator = $query->latest()->paginate(50);

        return $this->paginated($paginator);
    }

    /**
     * POST /api/v1/live-chat/messages
     */
    public function storeMessage(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_id'  => 'required|integer|exists:chat_sessions,id',
            'message'     => 'required|string',
            'sender_type' => 'nullable|string|in:visitor,agent,bot',
        ]);

        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $validated['tenant_id']  = $tenantId;
        $validated['sender_type'] = $validated['sender_type'] ?? 'agent';
        $validated['agent_id']   = $request->user()->id;

        $message = ChatMessage::create($validated);

        return $this->success($message, 201);
    }
}
