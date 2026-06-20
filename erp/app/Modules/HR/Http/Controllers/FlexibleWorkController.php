<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\FlexibleWorkArrangement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FlexibleWorkController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', FlexibleWorkArrangement::class);

        $arrangements = FlexibleWorkArrangement::with('employee')
            ->orderByDesc('created_at')
            ->paginate(20);

        return Inertia::render('HR/FlexibleWork/Index', compact('arrangements'));
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', FlexibleWorkArrangement::class);

        $data = $request->validate([
            'employee_id'      => ['required', 'exists:employees,id'],
            'arrangement_type' => ['required', 'string', 'max:50'],
            'start_date'       => ['required', 'date'],
            'end_date'         => ['nullable', 'date', 'after_or_equal:start_date'],
            'hours_per_week'   => ['nullable', 'integer', 'min:1', 'max:168'],
            'description'      => ['nullable', 'string'],
        ]);

        FlexibleWorkArrangement::create([
            'tenant_id' => auth()->user()->tenant_id,
            ...$data,
        ]);

        return redirect()->route('hr.flexible-work.index')->with('success', 'Flexible work arrangement created.');
    }

    public function show(FlexibleWorkArrangement $flexibleWork): Response
    {
        $this->authorize('view', $flexibleWork);

        $flexibleWork->load('employee');

        return Inertia::render('HR/FlexibleWork/Show', compact('flexibleWork'));
    }

    public function approve(FlexibleWorkArrangement $flexibleWork): RedirectResponse
    {
        $this->authorize('update', $flexibleWork);

        $flexibleWork->approve(auth()->id());

        return back()->with('success', 'Arrangement approved.');
    }

    public function reject(Request $request, FlexibleWorkArrangement $flexibleWork): RedirectResponse
    {
        $this->authorize('update', $flexibleWork);

        $request->validate([
            'reason' => ['required', 'string'],
        ]);

        $flexibleWork->reject($request->reason);

        return back()->with('success', 'Arrangement rejected.');
    }

    public function destroy(FlexibleWorkArrangement $flexibleWork): RedirectResponse
    {
        $this->authorize('delete', $flexibleWork);

        $flexibleWork->delete();

        return back()->with('success', 'Arrangement deleted.');
    }
}
