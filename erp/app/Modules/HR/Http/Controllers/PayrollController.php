<?php

namespace App\Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HR\Http\Requests\StorePayrollRunRequest;
use App\Modules\HR\Http\Resources\PayrollRunResource;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\PayrollItem;
use App\Modules\HR\Models\PayrollRun;
use App\Modules\HR\Models\Payslip;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PayrollController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', PayrollRun::class);

        $query = PayrollRun::query()->latest('period_start');

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $runs = $query->paginate(15);

        return Inertia::render('HR/Payroll/Index', [
            'runs'    => $runs,
            'filters' => $request->only(['status']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('HR/Payroll/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'period_start' => ['required', 'date'],
            'period_end'   => ['required', 'date', 'after_or_equal:period_start'],
            'run_date'     => ['required', 'date'],
            'notes'        => ['nullable', 'string'],
        ]);

        $run = PayrollRun::create([
            'tenant_id'    => auth()->user()->tenant_id,
            'period_start' => $validated['period_start'],
            'period_end'   => $validated['period_end'],
            'run_date'     => $validated['run_date'],
            'notes'        => $validated['notes'] ?? null,
            'status'       => 'draft',
        ]);

        return redirect()->route('hr.payroll.show', $run);
    }

    public function show(PayrollRun $payrollRun): Response
    {
        $payrollRun->load(['payslips.employee']);

        return Inertia::render('HR/Payroll/Show', [
            'payrollRun' => $payrollRun,
        ]);
    }

    public function destroy(PayrollRun $payrollRun): RedirectResponse
    {
        $this->authorize('delete', $payrollRun);

        $payrollRun->delete();

        return redirect()->route('hr.payroll.index');
    }

    public function generate(Request $request, PayrollRun $payrollRun): RedirectResponse
    {
        $this->authorize('update', $payrollRun);

        $count = $payrollRun->generatePayslips();
        $payrollRun->recalculateTotals();

        return back()->with('success', "Generated {$count} payslips.");
    }

    public function approve(PayrollRun $payrollRun): RedirectResponse
    {
        $this->authorize('update', $payrollRun);

        $payrollRun->approve(auth()->user());

        return back()->with('success', 'Payroll run approved.');
    }

    public function markPaid(PayrollRun $payrollRun): RedirectResponse
    {
        $this->authorize('update', $payrollRun);

        $payrollRun->markPaid();

        return back()->with('success', 'Payroll run marked as paid.');
    }

    // ─── Legacy methods (backward-compat with existing PayrollTest.php) ───

    public function legacyIndex(): Response
    {
        $this->authorize('viewAny', Employee::class);

        $runs = PayrollRun::with('items')
            ->latest('period_start')
            ->paginate(25);

        return Inertia::render('HR/Payroll/Index', [
            'runs'        => PayrollRunResource::collection($runs),
            'filters'     => [],
            'breadcrumbs' => [
                ['label' => 'HR'],
                ['label' => 'Payroll', 'href' => route('hr.payroll.index')],
            ],
        ]);
    }

    public function legacyCreate(): Response
    {
        $this->authorize('create', Employee::class);

        $employees = Employee::active()->with('department')->orderBy('last_name')->get();

        return Inertia::render('HR/Payroll/Create', [
            'employees'   => $employees->map(fn ($e) => [
                'id'            => $e->id,
                'full_name'     => $e->full_name,
                'position'      => $e->position,
                'department'    => $e->department?->name,
                'salary_type'   => $e->salary_type,
                'salary_amount' => $e->salary_amount,
            ]),
            'breadcrumbs' => [
                ['label' => 'HR'],
                ['label' => 'Payroll', 'href' => route('hr.payroll.index')],
                ['label' => 'New Run'],
            ],
        ]);
    }

    public function legacyStore(StorePayrollRunRequest $request): RedirectResponse
    {
        $this->authorize('create', Employee::class);

        $data = $request->validated();

        $run = DB::transaction(function () use ($data, $request) {
            $run = PayrollRun::create([
                'tenant_id'    => auth()->user()->tenant_id,
                'period_start' => $data['period_start'],
                'period_end'   => $data['period_end'],
                'notes'        => $data['notes'] ?? null,
                'created_by'   => auth()->id(),
            ]);

            $items = $request->input('items', []);

            foreach ($items as $item) {
                $gross      = (float) ($item['gross_salary'] ?? 0);
                $deductions = (float) ($item['deductions'] ?? 0);

                PayrollItem::create([
                    'payroll_run_id' => $run->id,
                    'employee_id'    => $item['employee_id'],
                    'gross_salary'   => $gross,
                    'deductions'     => $deductions,
                    'net_salary'     => max(0, $gross - $deductions),
                    'notes'          => $item['notes'] ?? null,
                ]);
            }

            return $run;
        });

        return redirect()->route('hr.payroll.show', $run)
            ->with('success', 'Payroll run created.');
    }

    public function legacyShow(PayrollRun $payrollRun): Response
    {
        $this->authorize('viewAny', Employee::class);

        $payrollRun->load(['items.employee.department', 'creator']);

        return Inertia::render('HR/Payroll/Show', [
            'run'         => new PayrollRunResource($payrollRun),
            'breadcrumbs' => [
                ['label' => 'HR'],
                ['label' => 'Payroll', 'href' => route('hr.payroll.index')],
                ['label' => "Run #{$payrollRun->id}"],
            ],
        ]);
    }

    public function process(PayrollRun $payrollRun): RedirectResponse
    {
        $this->authorize('update', Employee::class);

        try {
            $payrollRun->process();
        } catch (\DomainException $e) {
            return back()->withErrors(['status' => $e->getMessage()]);
        }

        return back()->with('success', 'Payroll run processed.');
    }
}
