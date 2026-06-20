<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\LeaveType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LeaveTypeController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', LeaveType::class);

        $leaveTypes = LeaveType::latest()->paginate(25)->withQueryString();

        return Inertia::render('HR/LeaveTypes/Index', [
            'leaveTypes'  => $leaveTypes,
            'breadcrumbs' => [
                ['label' => 'HR'],
                ['label' => 'Leave Types', 'href' => route('hr.leave-types.index')],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', LeaveType::class);

        $data = $request->validate([
            'name'               => 'required|string|max:255',
            'code'               => 'nullable|string|max:10',
            'default_days'       => 'nullable|integer|min:0',
            'is_paid'            => 'nullable|boolean',
            'requires_approval'  => 'nullable|boolean',
            'description'        => 'nullable|string',
        ]);

        LeaveType::create([
            'tenant_id'         => auth()->user()->tenant_id,
            'name'              => $data['name'],
            'code'              => $data['code'] ?? null,
            'default_days'      => $data['default_days'] ?? 0,
            'days_per_year'     => $data['default_days'] ?? 0,
            'is_paid'           => $data['is_paid'] ?? true,
            'requires_approval' => $data['requires_approval'] ?? true,
            'description'       => $data['description'] ?? null,
        ]);

        return back()->with('success', 'Leave type created.');
    }

    public function update(Request $request, LeaveType $leaveType): RedirectResponse
    {
        $this->authorize('update', $leaveType);

        $data = $request->validate([
            'name'               => 'required|string|max:255',
            'code'               => 'nullable|string|max:10',
            'default_days'       => 'nullable|integer|min:0',
            'is_paid'            => 'nullable|boolean',
            'requires_approval'  => 'nullable|boolean',
            'description'        => 'nullable|string',
        ]);

        $leaveType->update([
            'name'              => $data['name'],
            'code'              => $data['code'] ?? $leaveType->code,
            'default_days'      => $data['default_days'] ?? $leaveType->default_days,
            'days_per_year'     => $data['default_days'] ?? $leaveType->days_per_year,
            'is_paid'           => $data['is_paid'] ?? $leaveType->is_paid,
            'requires_approval' => $data['requires_approval'] ?? $leaveType->requires_approval,
            'description'       => $data['description'] ?? $leaveType->description,
        ]);

        return back()->with('success', 'Leave type updated.');
    }

    public function destroy(LeaveType $leaveType): RedirectResponse
    {
        $this->authorize('delete', $leaveType);

        $leaveType->delete();

        return back()->with('success', 'Leave type deleted.');
    }
}
