<?php

namespace App\Modules\Accounting\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Accounting\Models\AccountingPeriod;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountingPeriodController extends Controller
{
    public function index(): Response
    {
        $periods = AccountingPeriod::withoutGlobalScopes()
            ->where('tenant_id', auth()->user()->tenant_id)
            ->orderByDesc('start_date')
            ->get();

        return Inertia::render('Accounting/Periods/Index', [
            'periods' => $periods,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:100',
            'start_date'  => 'required|date',
            'end_date'    => 'required|date|after_or_equal:start_date',
            'fiscal_year' => 'required|integer|min:2000|max:2100',
            'quarter'     => 'nullable|integer|min:1|max:4',
            'status'      => 'in:open,closed,locked',
        ]);

        $data['tenant_id'] = auth()->user()->tenant_id;
        $data['status']    = $data['status'] ?? 'open';

        AccountingPeriod::create($data);

        return back()->with('success', 'Accounting period created.');
    }

    public function close(AccountingPeriod $period): RedirectResponse
    {
        $period->close();

        return back()->with('success', 'Period closed successfully.');
    }
}
