<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\PaymentSchedule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentScheduleController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', PaymentSchedule::class);

        $schedules = PaymentSchedule::query()
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Finance/PaymentSchedules/Index', [
            'paymentSchedules' => $schedules,
            'filters'          => $request->only(['status']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', PaymentSchedule::class);

        return Inertia::render('Finance/PaymentSchedules/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', PaymentSchedule::class);

        $validated = $request->validate([
            'name'         => 'required|string|max:255',
            'total_amount' => 'required|numeric|min:0',
            'installments' => 'required|integer|min:1',
            'start_date'   => 'required|date',
            'frequency'    => 'required|in:monthly,quarterly,annual,custom',
        ]);

        PaymentSchedule::create([
            ...$validated,
            'tenant_id'  => app('tenant')->id,
            'created_by' => auth()->id(),
        ]);

        return redirect()->route('finance.payment-schedules.index')
            ->with('success', 'Payment schedule created.');
    }

    public function show(PaymentSchedule $paymentSchedule): Response
    {
        $this->authorize('view', $paymentSchedule);

        return Inertia::render('Finance/PaymentSchedules/Show', [
            'paymentSchedule' => $paymentSchedule->load('items'),
        ]);
    }

    public function edit(PaymentSchedule $paymentSchedule): Response
    {
        $this->authorize('update', $paymentSchedule);

        return Inertia::render('Finance/PaymentSchedules/Edit', [
            'paymentSchedule' => $paymentSchedule,
        ]);
    }

    public function update(Request $request, PaymentSchedule $paymentSchedule): RedirectResponse
    {
        $this->authorize('update', $paymentSchedule);

        $validated = $request->validate([
            'name'         => 'required|string|max:255',
            'total_amount' => 'required|numeric|min:0',
            'installments' => 'required|integer|min:1',
            'start_date'   => 'required|date',
            'frequency'    => 'required|in:monthly,quarterly,annual,custom',
        ]);

        $paymentSchedule->update($validated);

        return redirect()->route('finance.payment-schedules.index')
            ->with('success', 'Payment schedule updated.');
    }

    public function destroy(PaymentSchedule $paymentSchedule): RedirectResponse
    {
        $this->authorize('delete', $paymentSchedule);

        $paymentSchedule->delete();

        return redirect()->route('finance.payment-schedules.index')
            ->with('success', 'Payment schedule deleted.');
    }

    public function pause(PaymentSchedule $paymentSchedule): RedirectResponse
    {
        $this->authorize('pause', $paymentSchedule);

        $paymentSchedule->pause();

        return redirect()->route('finance.payment-schedules.index')
            ->with('success', 'Payment schedule paused.');
    }

    public function resume(PaymentSchedule $paymentSchedule): RedirectResponse
    {
        $this->authorize('resume', $paymentSchedule);

        $paymentSchedule->resume();

        return redirect()->route('finance.payment-schedules.index')
            ->with('success', 'Payment schedule resumed.');
    }

    public function cancel(PaymentSchedule $paymentSchedule): RedirectResponse
    {
        $this->authorize('cancel', $paymentSchedule);

        $paymentSchedule->cancel();

        return redirect()->route('finance.payment-schedules.index')
            ->with('success', 'Payment schedule cancelled.');
    }
}
