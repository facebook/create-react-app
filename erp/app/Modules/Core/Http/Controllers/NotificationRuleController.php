<?php

namespace App\Modules\Core\Http\Controllers;

use App\Modules\Core\Models\NotificationRule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Inertia\Inertia;
use Inertia\Response;

class NotificationRuleController extends Controller
{
    public function index(Request $request): Response
    {
        $rules = NotificationRule::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->paginate(20);

        return Inertia::render('Core/NotificationRules/Index', [
            'rules' => $rules,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Core/NotificationRules/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'       => ['required', 'string', 'max:255'],
            'event_type' => ['required', 'string', 'max:100'],
            'conditions' => ['nullable', 'array'],
        ]);

        NotificationRule::create(array_merge($validated, [
            'user_id' => auth()->id(),
        ]));

        return redirect()->route('notification-rules.index')
            ->with('success', 'Notification rule created.');
    }

    public function destroy(Request $request, NotificationRule $notificationRule): RedirectResponse
    {
        if ($notificationRule->user_id !== $request->user()->id) {
            abort(403);
        }

        $notificationRule->delete();

        return redirect()->route('notification-rules.index')
            ->with('success', 'Notification rule deleted.');
    }

    public function toggle(Request $request, NotificationRule $notificationRule): RedirectResponse
    {
        if ($notificationRule->user_id !== $request->user()->id) {
            abort(403);
        }

        $notificationRule->update(['is_active' => ! $notificationRule->is_active]);

        return back()->with('success', 'Notification rule updated.');
    }
}
