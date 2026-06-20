<?php

namespace App\Modules\SocialMarketing\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\SocialMarketing\Models\SocialAccount;
use App\Modules\SocialMarketing\Models\SocialPost;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SocialMarketingController extends Controller
{
    public function dashboard(): Response
    {
        $totalAccounts     = SocialAccount::count();
        $connectedAccounts = SocialAccount::where('is_connected', true)->count();
        $totalPosts        = SocialPost::count();
        $scheduledPosts    = SocialPost::where('status', 'scheduled')->count();

        $publishedThisMonth = SocialPost::where('status', 'published')
            ->whereYear('published_at', now()->year)
            ->whereMonth('published_at', now()->month)
            ->count();

        $totalReach = SocialPost::where('status', 'published')
            ->get()
            ->sum(fn ($post) => $post->getTotalReach());

        return Inertia::render('SocialMarketing/Dashboard', [
            'stats' => [
                'total_accounts'       => $totalAccounts,
                'connected_accounts'   => $connectedAccounts,
                'total_posts'          => $totalPosts,
                'scheduled_posts'      => $scheduledPosts,
                'published_this_month' => $publishedThisMonth,
                'total_reach'          => $totalReach,
            ],
        ]);
    }

    public function accounts(): Response
    {
        $accounts = SocialAccount::orderBy('platform')->get();

        return Inertia::render('SocialMarketing/Accounts/Index', [
            'accounts' => $accounts,
        ]);
    }

    public function storeAccount(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'platform'        => ['required', 'string', 'in:facebook,twitter,linkedin,instagram,youtube,tiktok'],
            'account_name'    => ['required', 'string'],
            'account_handle'  => ['nullable', 'string'],
            'followers_count' => ['nullable', 'integer'],
        ]);

        SocialAccount::create($validated);

        return back()->with('success', 'Account connected successfully.');
    }

    public function toggleAccount(SocialAccount $account): RedirectResponse
    {
        if ($account->is_connected) {
            $account->disconnect();
        } else {
            $account->reconnect();
        }

        return back()->with('success', 'Account connection toggled.');
    }

    public function posts(Request $request): Response
    {
        $query = SocialPost::with('author')->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $posts = $query->paginate(20);

        return Inertia::render('SocialMarketing/Posts/Index', [
            'posts'          => $posts,
            'currentStatus'  => $request->input('status', ''),
        ]);
    }

    public function createPost(): Response
    {
        $accounts = SocialAccount::where('is_connected', true)->get();

        return Inertia::render('SocialMarketing/Posts/Create', [
            'accounts' => $accounts,
        ]);
    }

    public function storePost(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'content'            => ['required', 'string', 'max:2000'],
            'platforms'          => ['required', 'array'],
            'platforms.*'        => ['string', 'in:facebook,twitter,linkedin,instagram,youtube,tiktok'],
            'social_account_ids' => ['nullable', 'array'],
            'scheduled_at'       => ['nullable', 'date_format:Y-m-d H:i:s'],
        ]);

        $post = SocialPost::create(array_merge($validated, [
            'status'             => 'draft',
            'created_by'         => auth()->id(),
            'social_account_ids' => $validated['social_account_ids'] ?? [],
        ]));

        if (!empty($validated['scheduled_at'])) {
            $post->schedule(Carbon::parse($validated['scheduled_at']));
        }

        return redirect()->route('social-marketing.posts')->with('success', 'Post created successfully.');
    }

    public function updatePost(Request $request, SocialPost $post): RedirectResponse
    {
        $validated = $request->validate([
            'content'            => ['required', 'string', 'max:2000'],
            'platforms'          => ['required', 'array'],
            'platforms.*'        => ['string', 'in:facebook,twitter,linkedin,instagram,youtube,tiktok'],
            'social_account_ids' => ['nullable', 'array'],
            'scheduled_at'       => ['nullable', 'date_format:Y-m-d H:i:s'],
        ]);

        $post->update($validated);

        return back()->with('success', 'Post updated successfully.');
    }

    public function publishPost(SocialPost $post): RedirectResponse
    {
        $post->publish();

        return back()->with('success', 'Post published successfully.');
    }

    public function schedulePost(Request $request, SocialPost $post): RedirectResponse
    {
        $validated = $request->validate([
            'scheduled_at' => ['required'],
        ]);

        $post->schedule(Carbon::parse($validated['scheduled_at']));

        return back()->with('success', 'Post scheduled successfully.');
    }

    public function deletePost(SocialPost $post): RedirectResponse
    {
        $post->delete();

        return back()->with('success', 'Post deleted successfully.');
    }
}
