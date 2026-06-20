<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\HrAnnouncement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HrAnnouncementController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', HrAnnouncement::class);

        $announcements = HrAnnouncement::with('createdBy')
            ->when($request->target_audience, fn ($q) => $q->where('target_audience', $request->target_audience))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('HR/Announcements/Index', [
            'announcements' => $announcements,
            'filters'       => $request->only(['target_audience']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', HrAnnouncement::class);

        $validated = $request->validate([
            'title'           => 'required|string|max:255',
            'body'            => 'required|string',
            'target_audience' => 'nullable|string|in:all,department,role',
            'department_id'   => 'nullable|exists:departments,id',
            'priority'        => 'nullable|string|in:low,normal,high,urgent',
            'publish_at'      => 'nullable|date',
            'expire_at'       => 'nullable|date',
        ]);

        $announcement = HrAnnouncement::create([
            'tenant_id'       => auth()->user()->tenant_id,
            'created_by'      => auth()->id(),
            'title'           => $validated['title'],
            'body'            => $validated['body'],
            'target_audience' => $validated['target_audience'] ?? 'all',
            'department_id'   => $validated['department_id'] ?? null,
            'priority'        => $validated['priority'] ?? 'normal',
            'publish_at'      => $validated['publish_at'] ?? null,
            'expire_at'       => $validated['expire_at'] ?? null,
        ]);

        return redirect()->route('hr.announcements.show', $announcement);
    }

    public function show(HrAnnouncement $announcement): Response
    {
        $this->authorize('view', $announcement);

        $announcement->load(['createdBy', 'department']);

        return Inertia::render('HR/Announcements/Show', [
            'announcement' => $announcement,
        ]);
    }

    public function publish(HrAnnouncement $announcement): RedirectResponse
    {
        $this->authorize('update', $announcement);

        $announcement->publish();

        return redirect()->back()->with('success', 'Announcement published successfully.');
    }

    public function archive(HrAnnouncement $announcement): RedirectResponse
    {
        $this->authorize('update', $announcement);

        $announcement->archive();

        return redirect()->back()->with('success', 'Announcement archived successfully.');
    }

    public function destroy(HrAnnouncement $announcement): RedirectResponse
    {
        $this->authorize('delete', $announcement);

        $announcement->delete();

        return redirect()->route('hr.announcements.index');
    }
}
