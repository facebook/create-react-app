<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Http\Requests\StorePayrollRunRequest;
use App\Modules\HR\Http\Resources\PayrollRunResource;
use App\Modules\HR\Models\PayrollRun;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PayrollRunController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', PayrollRun::class);

        $runs = PayrollRun::latest('period_start')
            ->paginate(25);

        return Inertia::render('HR/PayrollRuns/Index', [
            'payrollRuns' => PayrollRunResource::collection($runs),
            'breadcrumbs' => [
                ['label' => 'HR'],
                ['label' => 'Payroll Runs', 'href' => route('hr.payroll-runs.index')],
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', PayrollRun::class);

        return Inertia::render('HR/PayrollRuns/Create', [
            'breadcrumbs' => [
                ['label' => 'HR'],
                ['label' => 'Payroll Runs', 'href' => route('hr.payroll-runs.index')],
                ['label' => 'New Payroll Run'],
            ],
        ]);
    }

    public function store(StorePayrollRunRequest $request): RedirectResponse
    {
        $this->authorize('create', PayrollRun::class);

        $data = $request->validated();

        $run = PayrollRun::create([
            ...$data,
            'tenant_id'  => auth()->user()->tenant_id,
            'created_by' => auth()->id(),
        ]);

        return redirect()->route('hr.payroll-runs.show', $run)
            ->with('success', 'Payroll run created.');
    }

    public function show(PayrollRun $payrollRun): Response
    {
        $this->authorize('view', $payrollRun);

        $payrollRun->load(['creator']);

        return Inertia::render('HR/PayrollRuns/Show', [
            'payrollRun'  => new PayrollRunResource($payrollRun),
            'breadcrumbs' => [
                ['label' => 'HR'],
                ['label' => 'Payroll Runs', 'href' => route('hr.payroll-runs.index')],
                ['label' => $payrollRun->period_label ?? "Payroll Run #{$payrollRun->id}"],
            ],
        ]);
    }

    public function destroy(PayrollRun $payrollRun): RedirectResponse
    {
        $this->authorize('delete', $payrollRun);

        $payrollRun->delete();

        return redirect()->route('hr.payroll-runs.index')
            ->with('success', 'Payroll run deleted.');
    }

    public function process(PayrollRun $payrollRun): RedirectResponse
    {
        $this->authorize('update', $payrollRun);

        try {
            $payrollRun->process();
        } catch (\DomainException $e) {
            return back()->withErrors(['status' => $e->getMessage()]);
        }

        return redirect()->route('hr.payroll-runs.show', $payrollRun)
            ->with('success', 'Payroll run processed.');
    }
}
