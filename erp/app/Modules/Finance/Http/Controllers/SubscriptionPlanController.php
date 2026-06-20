<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\SubscriptionPlan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionPlanController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', SubscriptionPlan::class);

        $plans = SubscriptionPlan::withCount('subscriptions')
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Finance/SubscriptionPlans/Index', [
            'plans' => $plans,
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Subscription Plans', 'href' => route('finance.subscription-plans.index')],
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', SubscriptionPlan::class);

        return Inertia::render('Finance/SubscriptionPlans/Create', [
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Subscription Plans', 'href' => route('finance.subscription-plans.index')],
                ['label' => 'New Plan'],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', SubscriptionPlan::class);

        $data = $request->validate([
            'name'          => ['required', 'string', 'max:255'],
            'billing_cycle' => ['required', Rule::in(['monthly', 'quarterly', 'annual', 'annually'])],
            'price'         => ['required', 'numeric', 'min:0'],
            'trial_days'    => ['nullable', 'integer', 'min:0'],
            'description'   => ['nullable', 'string'],
            'is_active'     => ['nullable', 'boolean'],
        ]);

        // Normalize 'annually' to 'annual' for DB compatibility
        if (($data['billing_cycle'] ?? '') === 'annually') {
            $data['billing_cycle'] = 'annual';
        }

        $plan = SubscriptionPlan::create([
            'tenant_id'     => auth()->user()->tenant_id,
            'name'          => $data['name'],
            'billing_cycle' => $data['billing_cycle'],
            'price'         => $data['price'],
            'trial_days'    => $data['trial_days'] ?? 0,
            'description'   => $data['description'] ?? null,
            'is_active'     => $data['is_active'] ?? true,
        ]);

        return redirect()->route('finance.subscription-plans.show', $plan)
            ->with('success', 'Subscription plan created.');
    }

    public function show(SubscriptionPlan $subscriptionPlan): Response
    {
        $this->authorize('view', $subscriptionPlan);

        $subscriptionPlan->loadCount('subscriptions');

        return Inertia::render('Finance/SubscriptionPlans/Show', [
            'plan' => $subscriptionPlan,
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Subscription Plans', 'href' => route('finance.subscription-plans.index')],
                ['label' => $subscriptionPlan->name],
            ],
        ]);
    }

    public function destroy(SubscriptionPlan $subscriptionPlan): RedirectResponse
    {
        $this->authorize('delete', $subscriptionPlan);

        $subscriptionPlan->delete();

        return redirect()->route('finance.subscription-plans.index')
            ->with('success', 'Subscription plan deleted.');
    }
}
