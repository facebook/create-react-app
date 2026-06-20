<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\Contact;
use App\Modules\Finance\Models\Subscription;
use App\Modules\Finance\Models\SubscriptionPlan;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Subscription::class);

        $subscriptions = Subscription::with(['plan'])
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Finance/Subscriptions/Index', [
            'subscriptions' => $subscriptions,
            'filters'       => $request->only(['status']),
            'breadcrumbs'   => [
                ['label' => 'Finance'],
                ['label' => 'Subscriptions', 'href' => route('finance.subscriptions.index')],
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Subscription::class);

        return Inertia::render('Finance/Subscriptions/Create', [
            'contacts' => Contact::customers()->active()->orderBy('name')->get(['id', 'name']),
            'plans'    => SubscriptionPlan::where('is_active', true)->orderBy('name')->get(['id', 'name', 'billing_cycle', 'price']),
            'breadcrumbs' => [
                ['label' => 'Finance'],
                ['label' => 'Subscriptions', 'href' => route('finance.subscriptions.index')],
                ['label' => 'New Subscription'],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Subscription::class);

        $data = $request->validate([
            'plan_id'              => ['required', Rule::exists('subscription_plans', 'id')],
            'customer_name'        => ['nullable', 'string', 'max:255'],
            'customer_email'       => ['nullable', 'email', 'max:255'],
            'current_period_start' => ['nullable', 'date'],
            'current_period_end'   => ['nullable', 'date'],
            'notes'                => ['nullable', 'string'],
        ]);

        $plan = SubscriptionPlan::find($data['plan_id']);

        $trialEndsAt = null;
        $status      = 'active';
        $today       = Carbon::today()->toDateString();

        if ($plan && $plan->trial_days > 0) {
            $status      = 'trial';
            $trialEndsAt = Carbon::today()->addDays($plan->trial_days)->toDateString();
        }

        $subscription = Subscription::create([
            'tenant_id'            => auth()->user()->tenant_id,
            'plan_id'              => $data['plan_id'],
            'customer_name'        => $data['customer_name'] ?? null,
            'customer_email'       => $data['customer_email'] ?? null,
            'status'               => $status,
            'current_period_start' => $data['current_period_start'] ?? $today,
            'current_period_end'   => $data['current_period_end'] ?? ($plan ? $plan->getNextBillingDate($today) : null),
            'trial_ends_at'        => $trialEndsAt,
            'notes'                => $data['notes'] ?? null,
        ]);

        return redirect()->route('finance.subscriptions.show', $subscription)
            ->with('success', 'Subscription created.');
    }

    public function show(Subscription $subscription): Response
    {
        $this->authorize('view', $subscription);

        $subscription->load(['plan']);

        return Inertia::render('Finance/Subscriptions/Show', [
            'subscription' => $subscription,
            'breadcrumbs'  => [
                ['label' => 'Finance'],
                ['label' => 'Subscriptions', 'href' => route('finance.subscriptions.index')],
                ['label' => "Subscription #{$subscription->id}"],
            ],
        ]);
    }

    public function destroy(Subscription $subscription): RedirectResponse
    {
        $this->authorize('delete', $subscription);

        $subscription->delete();

        return redirect()->route('finance.subscriptions.index')
            ->with('success', 'Subscription deleted.');
    }

    public function activate(Subscription $subscription): RedirectResponse
    {
        $this->authorize('create', Subscription::class);

        $subscription->load('plan');
        $subscription->activate();

        return back()->with('success', 'Subscription activated.');
    }

    public function cancel(Subscription $subscription): RedirectResponse
    {
        $this->authorize('create', Subscription::class);

        $subscription->cancel();

        return back()->with('success', 'Subscription cancelled.');
    }

    public function pause(Subscription $subscription): RedirectResponse
    {
        $this->authorize('create', Subscription::class);

        $subscription->pause();

        return back()->with('success', 'Subscription paused.');
    }

    public function generateInvoice(Subscription $subscription): RedirectResponse
    {
        $this->authorize('create', Subscription::class);

        $subscription->load('plan');
        $invoice = $subscription->generateInvoice();

        return redirect()->route('finance.invoices.show', $invoice)
            ->with('success', 'Invoice generated.');
    }
}
