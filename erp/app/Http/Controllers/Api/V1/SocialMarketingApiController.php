<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\SocialMarketing\Models\SocialAccount;
use App\Modules\SocialMarketing\Models\SocialPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SocialMarketingApiController extends ApiController
{
    /**
     * GET /api/v1/social-marketing/accounts
     */
    public function accounts(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $paginator = SocialAccount::where('tenant_id', $tenantId)->latest()->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * GET /api/v1/social-marketing/posts
     */
    public function posts(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $query = SocialPost::where('tenant_id', $tenantId);

        if ($accountId = $request->query('social_account_id')) {
            $query->whereJsonContains('social_account_ids', (int) $accountId);
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $paginator = $query->latest()->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * GET /api/v1/social-marketing/posts/{id}
     */
    public function showPost(int $id): JsonResponse
    {
        $post = SocialPost::findOrFail($id);

        return $this->success($post);
    }

    /**
     * POST /api/v1/social-marketing/posts
     */
    public function storePost(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'content'            => 'required|string',
            'platforms'          => 'nullable|array',
            'social_account_ids' => 'nullable|array',
            'media_urls'         => 'nullable|array',
            'status'             => 'nullable|string|in:draft,scheduled,published',
            'scheduled_at'       => 'nullable|date',
            'campaign_id'        => 'nullable|integer',
        ]);

        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $validated['tenant_id']  = $tenantId;
        $validated['created_by'] = $request->user()->id;
        $validated['status']     = $validated['status'] ?? 'draft';

        $post = SocialPost::create($validated);

        return $this->success($post, 201);
    }

    /**
     * POST /api/v1/social-marketing/posts/{id}/publish
     */
    public function publishPost(int $id): JsonResponse
    {
        $post = SocialPost::findOrFail($id);
        $post->update([
            'status'       => 'published',
            'published_at' => now(),
        ]);

        return $this->success($post);
    }
}
