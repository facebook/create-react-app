<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\OvertimeRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OvertimeRequestController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', OvertimeRequest::class);
        $requests = OvertimeRequest::with('employee')
            ->where('tenant_id', app('tenant')->id)
            ->latest()
            ->paginate(20);
        return Inertia::render('HR/OvertimeRequests/Index', compact('requests'));
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', OvertimeRequest::class);
        $validated = $request->validate([
            'employee_id'    => 'required|exists:employees,id',
            'work_date'      => 'required|date',
            'hours'          => 'required|numeric|min:0.5|max:24',
            'rate_multiplier'=> 'sometimes|numeric|min:1',
            'reason'         => 'nullable|string',
        ]);
        $validated['tenant_id'] = app('tenant')->id;
        OvertimeRequest::create($validated);
        return back()->with('success', 'Overtime request submitted.');
    }

    public function show(OvertimeRequest $overtimeRequest): Response
    {
        $this->authorize('view', $overtimeRequest);
        return Inertia::render('HR/OvertimeRequests/Show', compact('overtimeRequest'));
    }

    public function approve(OvertimeRequest $overtimeRequest): RedirectResponse
    {
        $this->authorize('update', $overtimeRequest);
        $overtimeRequest->approve(auth()->id());
        return back()->with('success', 'Overtime request approved.');
    }

    public function reject(Request $request, OvertimeRequest $overtimeRequest): RedirectResponse
    {
        $this->authorize('update', $overtimeRequest);
        $validated = $request->validate(['reason' => 'required|string']);
        $overtimeRequest->reject($validated['reason']);
        return back()->with('success', 'Overtime request rejected.');
    }

    public function cancel(OvertimeRequest $overtimeRequest): RedirectResponse
    {
        $this->authorize('update', $overtimeRequest);
        $overtimeRequest->cancel();
        return back()->with('success', 'Overtime request cancelled.');
    }

    public function destroy(OvertimeRequest $overtimeRequest): RedirectResponse
    {
        $this->authorize('delete', $overtimeRequest);
        $overtimeRequest->delete();
        return back()->with('success', 'Overtime request deleted.');
    }
}
