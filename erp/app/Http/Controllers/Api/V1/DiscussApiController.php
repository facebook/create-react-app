<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Discuss\Models\DiscussChannel;
use App\Modules\Discuss\Models\DiscussMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DiscussApiController extends ApiController
{
    public function channels(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $paginator = DiscussChannel::where('tenant_id', $tenantId)
            ->where('is_archived', false)
            ->latest()
            ->paginate(15);

        return $this->paginated($paginator);
    }

    public function messages(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $query = DiscussMessage::where('tenant_id', $tenantId)
            ->whereNull('parent_id');

        if ($request->filled('channel_id')) {
            $query->where('channel_id', $request->channel_id);
        }

        return $this->paginated($query->latest()->paginate(25));
    }

    public function storeMessage(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $validated = $request->validate([
            'channel_id' => 'required|integer|exists:discuss_channels,id',
            'body'       => 'required|string',
            'parent_id'  => 'nullable|integer|exists:discuss_messages,id',
        ]);

        $validated['tenant_id'] = $tenantId;
        $validated['user_id']   = $request->user()->id;

        $message = DiscussMessage::create($validated);

        return $this->success($message->load('user'), 201);
    }
}
