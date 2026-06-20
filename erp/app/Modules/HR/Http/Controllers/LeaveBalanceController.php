<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Models\LeaveBalance;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LeaveBalanceController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', LeaveBalance::class);

        $balances = LeaveBalance::with(['employee', 'leaveType'])
            ->when($request->employee_id, fn ($q) => $q->where('employee_id', $request->employee_id))
            ->when($request->year, fn ($q) => $q->where('year', $request->year))
            ->latest()
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('HR/LeaveBalances/Index', [
            'balances'    => $balances,
            'filters'     => $request->only(['employee_id', 'year']),
            'breadcrumbs' => [
                ['label' => 'HR'],
                ['label' => 'Leave Balances', 'href' => route('hr.leave-balances.index')],
            ],
        ]);
    }

    public function update(Request $request, LeaveBalance $leaveBalance): RedirectResponse
    {
        $this->authorize('update', $leaveBalance);

        $data = $request->validate([
            'allocated_days' => 'required|numeric|min:0',
        ]);

        $leaveBalance->update($data);

        return back()->with('success', 'Leave balance updated.');
    }
}
