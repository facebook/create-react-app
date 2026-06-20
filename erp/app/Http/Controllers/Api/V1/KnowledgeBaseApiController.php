<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\KnowledgeBase\Models\KbArticle;
use App\Modules\KnowledgeBase\Models\KbCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KnowledgeBaseApiController extends ApiController
{
    /**
     * GET /api/v1/knowledge-base/articles
     */
    public function articles(Request $request): JsonResponse
    {
        $query = KbArticle::query();

        if ($categoryId = $request->query('category_id')) {
            $query->where('category_id', $categoryId);
        }

        if ($search = $request->query('search')) {
            $query->where('title', 'LIKE', '%' . $search . '%');
        }

        $paginator = $query->latest()->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * GET /api/v1/knowledge-base/articles/{id}
     */
    public function showArticle(int $id): JsonResponse
    {
        $article = KbArticle::findOrFail($id);

        return $this->success($article);
    }

    /**
     * GET /api/v1/knowledge-base/categories
     */
    public function categories(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $categories = KbCategory::where('tenant_id', $tenantId)->orderBy('sequence')->get();

        return $this->success($categories);
    }

    /**
     * POST /api/v1/knowledge-base/articles
     */
    public function storeArticle(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'content'     => 'required|string',
            'category_id' => 'nullable|integer|exists:kb_categories,id',
            'excerpt'     => 'nullable|string',
            'status'      => 'nullable|string|in:draft,published,archived',
            'tags'        => 'nullable|array',
        ]);

        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $validated['tenant_id'] = $tenantId;
        $validated['author_id'] = $request->user()->id;
        $validated['status']    = $validated['status'] ?? 'draft';

        $article = KbArticle::create($validated);

        return $this->success($article, 201);
    }

    /**
     * PUT /api/v1/knowledge-base/articles/{id}
     */
    public function updateArticle(Request $request, int $id): JsonResponse
    {
        $article = KbArticle::findOrFail($id);

        $validated = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'content'     => 'sometimes|string',
            'category_id' => 'nullable|integer|exists:kb_categories,id',
            'excerpt'     => 'nullable|string',
            'status'      => 'nullable|string|in:draft,published,archived',
            'tags'        => 'nullable|array',
        ]);

        $article->update($validated);

        return $this->success($article);
    }
}
