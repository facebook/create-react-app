<?php

namespace App\Modules\LiveChat\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\LiveChat\Models\ChatMessage;
use App\Modules\LiveChat\Models\ChatSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatWidgetController extends Controller
{
    public function createSession(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'channel_id'    => 'required|exists:chat_channels,id',
            'visitor_name'  => 'nullable|string|max:255',
            'visitor_email' => 'nullable|email|max:255',
            'source_url'    => 'nullable|string|max:500',
        ]);

        $session = ChatSession::create([
            'tenant_id'    => \App\Modules\LiveChat\Models\ChatChannel::find($validated['channel_id'])->tenant_id,
            'channel_id'   => $validated['channel_id'],
            'visitor_name' => $validated['visitor_name'] ?? null,
            'visitor_email'=> $validated['visitor_email'] ?? null,
            'source_url'   => $validated['source_url'] ?? null,
            'status'       => 'open',
            'started_at'   => now(),
        ]);

        $token = sha1($session->id . $session->created_at);

        return response()->json([
            'session_id' => $session->id,
            'token'      => $token,
        ]);
    }

    public function sendVisitorMessage(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_id' => 'required|exists:chat_sessions,id',
            'message'    => 'required|string',
        ]);

        $session = ChatSession::findOrFail($validated['session_id']);

        ChatMessage::create([
            'tenant_id'   => $session->tenant_id,
            'session_id'  => $session->id,
            'sender_type' => 'visitor',
            'message'     => $validated['message'],
        ]);

        $session->update(['last_message_at' => now()]);

        return response()->json(['success' => true]);
    }

    public function getMessages(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_id' => 'required|exists:chat_sessions,id',
        ]);

        $session  = ChatSession::findOrFail($validated['session_id']);
        $messages = $session->messages()->orderBy('created_at')->get();

        return response()->json($messages);
    }
}
