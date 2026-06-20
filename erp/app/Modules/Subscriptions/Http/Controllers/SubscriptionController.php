<?php

namespace App\Modules\Subscriptions\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Subscriptions\Models\Subscription;
use App\Modules\Subscriptions\Models\SubscriptionInvoice;
use App\Modules\Subscriptions\Models\SubscriptionPlan;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Subscription::with('plan');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('plan_id')) {
            $query->where('plan_id', $request->plan_id);
        }

        $subscriptions = $query->latest()->paginate(20)->withQueryString();

        $mrr = Subscription::with('plan')
            ->whereIn('status', ['trial', 'active'])
            ->get()
            ->sum(fn ($s) => $s->mrr());

        $plans = SubscriptionPlan::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('Subscriptions/Index', [
            'subscriptions' => $subscriptions,
            'plans'         => $plans,
            'mrr'           => $mrr,
            'filters'       => $request->only(['status', 'plan_id']),
        ]);
    }

    public function plans(Request $request): Response|JsonResponse
    {
        $plans = SubscriptionPlan::where('is_active', true)->orderBy('name')->get();

        if ($request->wantsJson()) {
            return response()->json($plans);
        }

        return Inertia::render('Subscriptions/Plans', [
            'plans' => $plans,
        ]);
    }

    public function show(Subscription $subscription): Response
    {
        $subscription->load([
            'plan',
            'invoices' => fn ($q) => $q->latest()->limit(10),
        ]);

        return Inertia::render('Subscriptions/Show', [
            'subscription' => $subscription,
        ]);
    }

    public function storePlan(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'description'   => 'nullable|string',
            'billing_cycle' => 'required|in:monthly,quarterly,annual',
            'price'         => 'required|numeric|min:0',
            'trial_days'    => 'nullable|integer|min:0',
            'is_active'     => 'nullable|boolean',
        ]);

        $plan = SubscriptionPlan::create($validated);

        if ($request->wantsJson()) {
            return response()->json($plan, 201);
        }

        return redirect()->route('subscriptions.index')->with('success', 'Plan created successfully.');
    }

    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'plan_id'        => 'required|integer',
            'customer_name'  => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'status'         => 'nullable|in:trial,active,past_due,cancelled,expired',
            'notes'          => 'nullable|string',
        ]);

        $plan = SubscriptionPlan::findOrFail($validated['plan_id']);

        if (! $plan->is_active) {
            if ($request->wantsJson()) {
                return response()->json(['message' => 'The selected plan is not active.'], 422);
            }
            return redirect()->back()->withErrors(['plan_id' => 'The selected plan is not active.']);
        }

        $today    = Carbon::today();
        $cycleDays = $plan->cycleDays();

        $subscription = Subscription::create([
            'plan_id'               => $plan->id,
            'customer_name'         => $validated['customer_name'],
            'customer_email'        => $validated['customer_email'],
            'status'                => $validated['status'] ?? 'active',
            'notes'                 => $validated['notes'] ?? null,
            'current_period_start'  => $today,
            'current_period_end'    => $today->copy()->addDays($cycleDays - 1),
        ]);

        // Create initial pending invoice
        $subscription->invoices()->create([
            'tenant_id'    => $subscription->tenant_id,
            'amount'       => $plan->price,
            'status'       => 'pending',
            'due_date'     => $today,
            'period_start' => $today,
            'period_end'   => $today->copy()->addDays($cycleDays - 1),
        ]);

        if ($request->wantsJson()) {
            return response()->json($subscription->load('plan', 'invoices'), 201);
        }

        return redirect()->route('subscriptions.show', $subscription)->with('success', 'Subscription created successfully.');
    }

    public function cancel(Subscription $subscription): RedirectResponse|JsonResponse
    {
        $subscription->cancel();

        if (request()->wantsJson()) {
            return response()->json($subscription->fresh());
        }

        return redirect()->route('subscriptions.show', $subscription)->with('success', 'Subscription cancelled.');
    }

    public function renew(Subscription $subscription): RedirectResponse|JsonResponse
    {
        $invoice = $subscription->renew();

        if (request()->wantsJson()) {
            return response()->json([
                'subscription' => $subscription->fresh()->load('plan'),
                'invoice'      => $invoice,
            ]);
        }

        return redirect()->route('subscriptions.show', $subscription)->with('success', 'Subscription renewed.');
    }

    public function payInvoice(Subscription $subscription, SubscriptionInvoice $invoice): RedirectResponse|JsonResponse
    {
        $invoice->markPaid();

        if (request()->wantsJson()) {
            return response()->json($invoice->fresh());
        }

        return redirect()->route('subscriptions.show', $subscription)->with('success', 'Invoice marked as paid.');
    }

    public function metrics(Request $request): Response|JsonResponse
    {
        $activeSubscriptions = Subscription::with('plan')
            ->whereIn('status', ['trial', 'active'])
            ->get();

        $mrr = $activeSubscriptions->sum(fn ($s) => $s->mrr());

        $activeCount = Subscription::where('status', 'active')->count();
        $trialCount  = Subscription::where('status', 'trial')->count();

        // Churn rate: cancelled this month / active last month
        $cancelledThisMonth = Subscription::where('status', 'cancelled')
            ->whereMonth('cancelled_at', now()->month)
            ->whereYear('cancelled_at', now()->year)
            ->count();

        $activeLastMonth = Subscription::whereIn('status', ['active', 'trial', 'cancelled', 'past_due', 'expired'])
            ->where('created_at', '<=', now()->startOfMonth())
            ->count();

        $churnRate = $activeLastMonth > 0
            ? round(($cancelledThisMonth / $activeLastMonth) * 100, 2)
            : 0.0;

        $metricsData = [
            'mrr'          => $mrr,
            'active_count' => $activeCount,
            'trial_count'  => $trialCount,
            'churn_rate'   => $churnRate,
        ];

        if ($request->wantsJson()) {
            return response()->json($metricsData);
        }

        return Inertia::render('Subscriptions/Metrics', $metricsData);
    }
}
