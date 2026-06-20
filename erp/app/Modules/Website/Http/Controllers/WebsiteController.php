<?php

namespace App\Modules\Website\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Website\Models\BlogPost;
use App\Modules\Website\Models\WebMenu;
use App\Modules\Website\Models\WebPage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class WebsiteController extends Controller
{
    public function dashboard(): Response
    {
        $stats = [
            'total_pages'     => WebPage::count(),
            'published_pages' => WebPage::where('status', 'published')->count(),
            'total_posts'     => BlogPost::count(),
            'published_posts' => BlogPost::where('status', 'published')->count(),
            'total_menus'     => WebMenu::count(),
        ];

        return Inertia::render('Website/Dashboard', ['stats' => $stats]);
    }

    public function pages(): Response
    {
        $pages = WebPage::orderByDesc('created_at')->paginate(20);

        return Inertia::render('Website/Pages/Index', ['pages' => $pages]);
    }

    public function storePage(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title'  => 'required|string|max:255',
            'slug'   => 'required|alpha_dash|max:255',
            'status' => 'sometimes|in:draft,published,archived',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        WebPage::create($validated);

        return redirect()->back();
    }

    public function updatePage(Request $request, WebPage $page): RedirectResponse
    {
        $validated = $request->validate([
            'title'  => 'required|string|max:255',
            'slug'   => 'required|alpha_dash|max:255',
            'status' => 'sometimes|in:draft,published,archived',
        ]);

        $page->update($validated);

        return redirect()->back();
    }

    public function publishPage(WebPage $page): JsonResponse
    {
        $page->publish();

        return response()->json(['success' => true]);
    }

    public function posts(): Response
    {
        $posts = BlogPost::orderByDesc('created_at')->paginate(20);

        return Inertia::render('Website/Blog/Index', ['posts' => $posts]);
    }

    public function storePost(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title'   => 'required|string|max:255',
            'slug'    => 'required|alpha_dash|max:255',
            'content' => 'nullable|string',
        ]);

        $validated['author_id'] = auth()->id();

        BlogPost::create($validated);

        return redirect()->back();
    }

    public function publishPost(BlogPost $post): JsonResponse
    {
        $post->publish();

        return response()->json(['success' => true]);
    }

    public function menus(): Response
    {
        $menus = WebMenu::all();

        return Inertia::render('Website/Menus/Index', ['menus' => $menus]);
    }

    public function storeMenu(Request $request): RedirectResponse
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'location' => 'required|in:header,footer,sidebar',
        ]);

        WebMenu::create($request->only(['name', 'location']));

        return redirect()->back();
    }

    public function updateMenu(Request $request, WebMenu $menu): JsonResponse
    {
        $request->validate([
            'items' => 'required|array',
        ]);

        $menu->update(['items' => $request->items]);

        return response()->json(['success' => true]);
    }
}
