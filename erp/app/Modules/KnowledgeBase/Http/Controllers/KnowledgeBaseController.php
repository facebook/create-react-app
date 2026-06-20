<?php

namespace App\Modules\KnowledgeBase\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\KnowledgeBase\Models\KbArticle;
use App\Modules\KnowledgeBase\Models\KbCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KnowledgeBaseController extends Controller
{
    public function index(Request $request): Response
    {
        $articles = KbArticle::with(['category', 'author'])
            ->when($request->search, function ($q, $search) {
                $q->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('content', 'like', "%{$search}%");
                });
            })
            ->when($request->category_id, fn ($q) => $q->where('category_id', $request->category_id))
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        $categories = KbCategory::with('children')->whereNull('parent_id')->orderBy('sequence')->get();

        return Inertia::render('KnowledgeBase/Index', [
            'articles'   => $articles,
            'categories' => $categories,
            'filters'    => $request->only(['search', 'category_id']),
        ]);
    }

    public function categories(): Response
    {
        $categories = KbCategory::with('children')
            ->whereNull('parent_id')
            ->orderBy('sequence')
            ->get()
            ->map(function (KbCategory $category) {
                return array_merge($category->toArray(), [
                    'article_count' => $category->articleCount(),
                ]);
            });

        return Inertia::render('KnowledgeBase/Categories', [
            'categories' => $categories,
        ]);
    }

    public function show(KbArticle $article): Response
    {
        $article->incrementViews();
        $article->load(['category', 'author']);

        return Inertia::render('KnowledgeBase/Show', [
            'article' => $article,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'content'     => 'required|string',
            'category_id' => 'nullable|exists:kb_categories,id',
            'excerpt'     => 'nullable|string',
            'tags'        => 'nullable|string',
            'status'      => 'nullable|in:draft,published,archived',
        ]);

        $article = new KbArticle();
        $article->tenant_id   = auth()->user()->tenant_id;
        $article->author_id   = auth()->id();
        $article->title       = $validated['title'];
        $article->content     = $validated['content'];
        $article->category_id = $validated['category_id'] ?? null;
        $article->excerpt     = $validated['excerpt'] ?? null;
        $article->status      = $validated['status'] ?? 'draft';

        // Handle tags: convert comma-separated string to array
        if (!empty($validated['tags'])) {
            $article->tags = array_map('trim', explode(',', $validated['tags']));
        }

        $article->slug = $article->generateSlug($validated['title']);
        $article->save();

        return redirect()->route('kb.show', $article)->with('success', 'Article created.');
    }

    public function update(Request $request, KbArticle $article): RedirectResponse
    {
        $validated = $request->validate([
            'title'       => 'sometimes|required|string|max:255',
            'content'     => 'sometimes|required|string',
            'category_id' => 'nullable|exists:kb_categories,id',
            'excerpt'     => 'nullable|string',
            'tags'        => 'nullable|string',
            'status'      => 'nullable|in:draft,published,archived',
        ]);

        if (isset($validated['tags']) && is_string($validated['tags'])) {
            $validated['tags'] = array_map('trim', explode(',', $validated['tags']));
        }

        $article->update($validated);

        return redirect()->route('kb.show', $article)->with('success', 'Article updated.');
    }

    public function destroy(KbArticle $article): RedirectResponse
    {
        $article->delete();

        return redirect()->route('kb.index')->with('success', 'Article deleted.');
    }

    public function publish(KbArticle $article): RedirectResponse
    {
        $article->publish();

        return redirect()->back()->with('success', 'Article published.');
    }

    public function archive(KbArticle $article): RedirectResponse
    {
        $article->archive();

        return redirect()->back()->with('success', 'Article archived.');
    }

    public function storeCategory(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'parent_id'   => 'nullable|exists:kb_categories,id',
            'sequence'    => 'nullable|integer',
        ]);

        $slug = \Illuminate\Support\Str::slug($validated['name']);
        $original = $slug;
        $count = 1;
        while (KbCategory::withoutGlobalScopes()->where('slug', $slug)->where('tenant_id', auth()->user()->tenant_id)->exists()) {
            $slug = $original . '-' . $count;
            $count++;
        }

        KbCategory::create([
            ...$validated,
            'tenant_id' => auth()->user()->tenant_id,
            'slug'      => $slug,
        ]);

        return redirect()->back()->with('success', 'Category created.');
    }

    public function search(Request $request): Response
    {
        $query = $request->get('q', '');

        $articles = KbArticle::with(['category', 'author'])
            ->where('status', 'published')
            ->when($query, function ($q) use ($query) {
                $q->where(function ($q) use ($query) {
                    $q->where('title', 'like', "%{$query}%")
                      ->orWhere('content', 'like', "%{$query}%");
                });
            })
            ->orderByDesc('published_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('KnowledgeBase/Search', [
            'articles' => $articles,
            'query'    => $query,
        ]);
    }
}
