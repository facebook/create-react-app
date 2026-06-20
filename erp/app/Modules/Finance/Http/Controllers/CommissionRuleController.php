<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Finance\Models\CommissionRule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CommissionRuleController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', CommissionRule::class);

        $rules = CommissionRule::with('user')
            ->latest()
            ->paginate(15);

        return Inertia::render('Finance/CommissionRules/Index', [
            'rules'       => $rules,
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Commission Rules', 'href' => route('finance.commission-rules.index')],
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', CommissionRule::class);

        return Inertia::render('Finance/CommissionRules/Create', [
            'users'       => User::orderBy('name')->get(['id', 'name']),
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Commission Rules', 'href' => route('finance.commission-rules.index')],
                ['label' => 'New Rule'],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', CommissionRule::class);

        $data = $request->validate([
            'user_id'      => ['required', Rule::exists('users', 'id')],
            'name'         => ['required', 'string', 'max:255'],
            'rate'         => ['required_if:type,percentage', 'nullable', 'numeric', 'min:0', 'max:1'],
            'type'         => ['required', Rule::in(['percentage', 'fixed'])],
            'fixed_amount' => ['required_if:type,fixed', 'nullable', 'numeric', 'min:0'],
        ]);

        $rule = CommissionRule::create([
            'tenant_id'    => auth()->user()->tenant_id,
            'user_id'      => $data['user_id'],
            'name'         => $data['name'],
            'type'         => $data['type'],
            'rate'         => $data['rate'] ?? 0,
            'fixed_amount' => $data['fixed_amount'] ?? null,
            'is_active'    => $request->boolean('is_active', true),
        ]);

        return redirect()->route('finance.commission-rules.show', $rule)
            ->with('success', 'Commission rule created.');
    }

    public function show(CommissionRule $commissionRule): Response
    {
        $this->authorize('view', $commissionRule);

        $commissionRule->load(['user', 'commissions.invoice']);

        return Inertia::render('Finance/CommissionRules/Show', [
            'rule'        => $commissionRule,
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Commission Rules', 'href' => route('finance.commission-rules.index')],
                ['label' => $commissionRule->name],
            ],
        ]);
    }

    public function destroy(CommissionRule $commissionRule): RedirectResponse
    {
        $this->authorize('delete', $commissionRule);

        $commissionRule->delete();

        return redirect()->route('finance.commission-rules.index')
            ->with('success', 'Commission rule deleted.');
    }
}
