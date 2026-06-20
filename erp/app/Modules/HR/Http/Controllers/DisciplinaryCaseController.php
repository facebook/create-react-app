<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\DisciplinaryCase;
use App\Modules\HR\Models\Employee;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DisciplinaryCaseController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', DisciplinaryCase::class);

        $cases = DisciplinaryCase::with(['employee', 'handledBy'])
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->employee_id, fn ($q) => $q->where('employee_id', $request->employee_id))
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('HR/DisciplinaryCases/Index', [
            'cases'   => $cases,
            'filters' => $request->only(['status', 'employee_id']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', DisciplinaryCase::class);

        $employees = Employee::where('status', 'active')
            ->orderBy('last_name')
            ->get(['id', 'first_name', 'last_name']);

        return Inertia::render('HR/DisciplinaryCases/Create', [
            'employees' => $employees,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', DisciplinaryCase::class);

        $validated = $request->validate([
            'employee_id'   => 'required|exists:employees,id',
            'incident_type' => 'required|in:misconduct,poor_performance,attendance,policy_violation,other',
            'incident_date' => 'required|date',
            'description'   => 'required|string',
            'severity'      => 'required|in:minor,moderate,major,gross',
        ]);

        $case = DisciplinaryCase::create([
            'tenant_id'     => auth()->user()->tenant_id,
            'employee_id'   => $validated['employee_id'],
            'incident_type' => $validated['incident_type'],
            'incident_date' => $validated['incident_date'],
            'description'   => $validated['description'],
            'severity'      => $validated['severity'],
            'status'        => 'open',
            'handled_by'    => auth()->id(),
        ]);

        $case->update([
            'reference' => 'DISC-' . now()->year . '-' . str_pad($case->id, 4, '0', STR_PAD_LEFT),
        ]);

        return redirect()->route('hr.disciplinary-cases.show', $case);
    }

    public function show(DisciplinaryCase $disciplinaryCase): Response
    {
        $this->authorize('view', $disciplinaryCase);

        $disciplinaryCase->load(['employee', 'handledBy']);

        return Inertia::render('HR/DisciplinaryCases/Show', [
            'disciplinaryCase' => $disciplinaryCase,
        ]);
    }

    public function destroy(DisciplinaryCase $disciplinaryCase): RedirectResponse
    {
        $this->authorize('delete', $disciplinaryCase);

        $disciplinaryCase->delete();

        return redirect()->route('hr.disciplinary-cases.index');
    }

    public function scheduleHearing(Request $request, DisciplinaryCase $disciplinaryCase): RedirectResponse
    {
        $this->authorize('update', $disciplinaryCase);

        $validated = $request->validate([
            'hearing_date' => 'required|date|after:today',
        ]);

        $disciplinaryCase->scheduleHearing(Carbon::parse($validated['hearing_date']));

        return redirect()->back();
    }

    public function resolve(Request $request, DisciplinaryCase $disciplinaryCase): RedirectResponse
    {
        $this->authorize('update', $disciplinaryCase);

        $validated = $request->validate([
            'outcome'       => 'required|in:warning,final_warning,suspension,dismissal,no_action',
            'outcome_notes' => 'nullable|string',
        ]);

        $disciplinaryCase->resolve($validated['outcome'], $validated['outcome_notes'] ?? null);

        return redirect()->back();
    }

    public function close(Request $request, DisciplinaryCase $disciplinaryCase): RedirectResponse
    {
        $this->authorize('update', $disciplinaryCase);

        $disciplinaryCase->close();

        return redirect()->back();
    }
}
