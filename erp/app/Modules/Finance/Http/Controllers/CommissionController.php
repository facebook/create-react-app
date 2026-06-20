<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Finance\Models\Commission;
use App\Modules\Finance\Models\CommissionRule;
use App\Modules\Finance\Models\Invoice;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CommissionController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Commission::class);

        $commissions = Commission::with(['rule', 'user', 'invoice'])
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->user_id, fn ($q) => $q->where('user_id', $request->user_id))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Finance/Commissions/Index', [
            'commissions' => $commissions,
            'users'       => User::orderBy('name')->get(['id', 'name']),
            'filters'     => $request->only(['status', 'user_id']),
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Commissions', 'href' => route('finance.commissions.index')],
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Commission::class);

        return Inertia::render('Finance/Commissions/Create', [
            'rules'       => CommissionRule::with('user')->where('is_active', true)->latest()->get(['id', 'name', 'user_id']),
            'invoices'    => Invoice::latest()->get(['id', 'number']),
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Commissions', 'href' => route('finance.commissions.index')],
                ['label' => 'New Commission'],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Commission::class);

        $data = $request->validate([
            'commission_rule_id' => ['required', Rule::exists('commission_rules', 'id')],
            'invoice_id'         => ['required', Rule::exists('invoices', 'id')],
            'notes'              => ['nullable', 'string'],
        ]);

        $rule    = CommissionRule::findOrFail($data['commission_rule_id']);
        $invoice = Invoice::with('items', 'payments')->findOrFail($data['invoice_id']);

        $invoiceAmount    = (float) $invoice->total;
        $commissionAmount = $rule->calculateCommission($invoiceAmount);

        $commission = Commission::create([
            'tenant_id'          => auth()->user()->tenant_id,
            'commission_rule_id' => $rule->id,
            'user_id'            => $rule->user_id,
            'invoice_id'         => $invoice->id,
            'invoice_amount'     => $invoiceAmount,
            'commission_amount'  => $commissionAmount,
            'status'             => 'pending',
            'notes'              => $data['notes'] ?? null,
        ]);

        return redirect()->route('finance.commissions.show', $commission)
            ->with('success', 'Commission created.');
    }

    public function show(Commission $commission): Response
    {
        $this->authorize('view', $commission);

        $commission->load(['rule', 'user', 'invoice']);

        return Inertia::render('Finance/Commissions/Show', [
            'commission'  => $commission,
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Commissions', 'href' => route('finance.commissions.index')],
                ['label' => "Commission #{$commission->id}"],
            ],
        ]);
    }

    public function destroy(Commission $commission): RedirectResponse
    {
        $this->authorize('delete', $commission);

        $commission->delete();

        return redirect()->route('finance.commissions.index')
            ->with('success', 'Commission deleted.');
    }

    public function approve(Commission $commission): RedirectResponse
    {
        $this->authorize('create', Commission::class);

        $commission->approve();

        return back()->with('success', 'Commission approved.');
    }

    public function markPaid(Commission $commission): RedirectResponse
    {
        $this->authorize('create', Commission::class);

        $commission->markPaid();

        return back()->with('success', 'Commission marked as paid.');
    }

    public function generate(Request $request): RedirectResponse
    {
        $this->authorize('create', Commission::class);

        $request->validate([
            'invoice_id' => ['required', Rule::exists('invoices', 'id')],
        ]);

        $invoice = Invoice::with('items', 'payments')->findOrFail($request->invoice_id);

        $rule = CommissionRule::where('user_id', $invoice->assigned_to_user_id)
            ->where('is_active', true)
            ->where('tenant_id', app('tenant')->id)
            ->first();

        if (!$rule) {
            return back()->with('error', 'No active commission rule for assigned user.');
        }

        $commission = Commission::create([
            'tenant_id'          => app('tenant')->id,
            'commission_rule_id' => $rule->id,
            'user_id'            => $rule->user_id,
            'invoice_id'         => $invoice->id,
            'invoice_amount'     => $invoice->total,
            'commission_amount'  => $rule->calculateCommission((float) $invoice->total),
            'status'             => 'pending',
        ]);

        return redirect()->route('finance.commissions.show', $commission);
    }
}
