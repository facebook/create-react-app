<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\ShiftTemplate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShiftTemplateController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', ShiftTemplate::class);

        $shiftTemplates = ShiftTemplate::withCount('assignments')
            ->orderBy('name')
            ->paginate(15);

        return Inertia::render('HR/ShiftTemplates/Index', compact('shiftTemplates'));
    }

    public function create(): Response
    {
        $this->authorize('create', ShiftTemplate::class);

        return Inertia::render('HR/ShiftTemplates/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', ShiftTemplate::class);

        $data = $request->validate([
            'name'         => ['required', 'string', 'max:255'],
            'start_time'   => ['required', 'string'],
            'end_time'     => ['required', 'string'],
            'break_minutes'=> ['integer', 'min:0'],
            'days_of_week' => ['array'],
            'color'        => ['nullable', 'string', 'max:20'],
            'is_active'    => ['boolean'],
        ]);

        $data['break_minutes'] = $data['break_minutes'] ?? 0;
        $data['tenant_id']     = auth()->user()->tenant_id;

        $template = ShiftTemplate::create($data);

        return redirect()->route('hr.shift-templates.show', $template);
    }

    public function show(ShiftTemplate $shiftTemplate): Response
    {
        $this->authorize('view', $shiftTemplate);

        $shiftTemplate->load([
            'assignments' => function ($query) {
                $query->with('employee')
                    ->where('assigned_date', '>=', now()->toDateString())
                    ->orderBy('assigned_date')
                    ->limit(20);
            },
        ]);

        return Inertia::render('HR/ShiftTemplates/Show', compact('shiftTemplate'));
    }

    public function destroy(ShiftTemplate $shiftTemplate): RedirectResponse
    {
        $this->authorize('delete', $shiftTemplate);

        $shiftTemplate->delete();

        return redirect()->route('hr.shift-templates.index')->with('success', 'Shift template deleted.');
    }
}
