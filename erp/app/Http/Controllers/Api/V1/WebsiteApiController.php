<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Website\Models\BlogPost;
use App\Modules\Website\Models\WebMenu;
use App\Modules\Website\Models\WebPage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WebsiteApiController extends ApiController
{
    /**
     * GET /api/v1/website/pages
     */
    public function pages(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $query = WebPage::where('tenant_id', $tenantId);

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $paginator = $query->latest()->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * GET /api/v1/website/pages/{id}
     */
    public function showPage(int $id): JsonResponse
    {
        $page = WebPage::findOrFail($id);

        return $this->success($page);
    }

    /**
     * POST /api/v1/website/pages
     */
    public function storePage(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'            => 'required|string|max:255',
            'slug'             => 'required|string|max:255',
            'content'          => 'nullable|string',
            'meta_title'       => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'status'           => 'nullable|string|in:draft,published,archived',
            'is_homepage'      => 'nullable|boolean',
            'layout'           => 'nullable|string|max:100',
        ]);

        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $validated['tenant_id'] = $tenantId;
        $validated['status']    = $validated['status'] ?? 'draft';

        $page = WebPage::create($validated);

        return $this->success($page, 201);
    }

    /**
     * GET /api/v1/website/blog-posts
     */
    public function blogPosts(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $query = BlogPost::where('tenant_id', $tenantId);

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $paginator = $query->latest()->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * GET /api/v1/website/blog-posts/{id}
     */
    public function showBlogPost(int $id): JsonResponse
    {
        $blogPost = BlogPost::findOrFail($id);

        return $this->success($blogPost);
    }

    /**
     * POST /api/v1/website/blog-posts
     */
    public function storeBlogPost(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'          => 'required|string|max:255',
            'slug'           => 'required|string|max:255',
            'excerpt'        => 'nullable|string',
            'content'        => 'nullable|string',
            'featured_image' => 'nullable|string',
            'status'         => 'nullable|string|in:draft,published,archived',
            'tags'           => 'nullable|array',
        ]);

        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $validated['tenant_id'] = $tenantId;
        $validated['author_id'] = $request->user()->id;
        $validated['status']    = $validated['status'] ?? 'draft';

        $blogPost = BlogPost::create($validated);

        return $this->success($blogPost, 201);
    }

    /**
     * GET /api/v1/website/menus
     */
    public function menus(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $menus = WebMenu::where('tenant_id', $tenantId)->get();

        return $this->success($menus);
    }
}
