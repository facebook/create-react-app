<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\Grievance;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GrievanceController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Grievance::class);

        $grievances = Grievance::with(['employee', 'assignedTo'])
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('HR/Grievances/Index', [
            'grievances' => $grievances,
            'filters'    => $request->only(['status']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Grievance::class);

        $employees = Employee::where('status', 'active')
            ->orderBy('last_name')
            ->get(['id', 'first_name', 'last_name']);

        return Inertia::render('HR/Grievances/Create', [
            'employees' => $employees,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Grievance::class);

        $validated = $request->validate([
            'employee_id'    => 'required|exists:employees,id',
            'category'       => 'required|string',
            'description'    => 'required|string',
            'submitted_date' => 'required|date',
            'is_anonymous'   => 'nullable|boolean',
        ]);

        $grievance = Grievance::create([
            'tenant_id'      => auth()->user()->tenant_id,
            'employee_id'    => $validated['employee_id'],
            'category'       => $validated['category'],
            'description'    => $validated['description'],
            'submitted_date' => $validated['submitted_date'],
            'is_anonymous'   => $validated['is_anonymous'] ?? false,
            'status'         => 'submitted',
        ]);

        $grievance->update([
            'reference' => 'GRV-' . now()->year . '-' . str_pad($grievance->id, 4, '0', STR_PAD_LEFT),
        ]);

        return redirect()->route('hr.grievances.show', $grievance);
    }

    public function show(Grievance $grievance): Response
    {
        $this->authorize('view', $grievance);

        $grievance->load(['employee', 'assignedTo']);

        return Inertia::render('HR/Grievances/Show', [
            'grievance' => $grievance,
        ]);
    }

    public function destroy(Grievance $grievance): RedirectResponse
    {
        $this->authorize('delete', $grievance);

        $grievance->delete();

        return redirect()->route('hr.grievances.index');
    }

    public function assign(Request $request, Grievance $grievance): RedirectResponse
    {
        $this->authorize('update', $grievance);

        $validated = $request->validate([
            'assigned_to' => 'required|integer|exists:users,id',
        ]);

        $grievance->assign($validated['assigned_to']);

        return redirect()->back();
    }

    public function resolve(Request $request, Grievance $grievance): RedirectResponse
    {
        $this->authorize('update', $grievance);

        $validated = $request->validate([
            'resolution' => 'required|string',
        ]);

        $grievance->resolve($validated['resolution']);

        return redirect()->back();
    }

    public function close(Request $request, Grievance $grievance): RedirectResponse
    {
        $this->authorize('update', $grievance);

        $grievance->close();

        return redirect()->back();
    }
}
