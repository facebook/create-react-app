<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Subscriptions\Models\Subscription;
use App\Modules\Subscriptions\Models\SubscriptionPlan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriptionsApiController extends ApiController
{
    /**
     * GET /api/v1/subscriptions/plans
     */
    public function plans(Request $request): JsonResponse
    {
        $query = SubscriptionPlan::query();

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->query('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $paginator = $query->latest()->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * POST /api/v1/subscriptions/plans
     */
    public function storePlan(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'description'   => 'nullable|string',
            'billing_cycle' => 'required|string|in:monthly,quarterly,annual',
            'price'         => 'required|numeric|min:0',
            'trial_days'    => 'nullable|integer|min:0',
            'is_active'     => 'nullable|boolean',
        ]);

        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $validated['tenant_id'] = $tenantId;

        $plan = SubscriptionPlan::create($validated);

        return $this->success($plan, 201);
    }

    /**
     * GET /api/v1/subscriptions
     */
    public function subscriptions(Request $request): JsonResponse
    {
        $query = Subscription::with('plan:id,name');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($planId = $request->query('plan_id')) {
            $query->where('plan_id', $planId);
        }

        $paginator = $query->latest()->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * GET /api/v1/subscriptions/{id}
     */
    public function showSubscription(int $id): JsonResponse
    {
        $subscription = Subscription::with('plan')->withCount('invoices')->findOrFail($id);

        return $this->success($subscription);
    }

    /**
     * POST /api/v1/subscriptions
     */
    public function storeSubscription(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'plan_id'              => 'required|integer|exists:subscription_plans,id',
            'customer_name'        => 'required|string|max:255',
            'customer_email'       => 'nullable|email|max:255',
            'status'               => 'nullable|string|in:trial,active,paused,cancelled,expired',
            'trial_ends_at'        => 'nullable|date',
            'current_period_start' => 'nullable|date',
            'current_period_end'   => 'nullable|date',
            'notes'                => 'nullable|string',
        ]);

        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $validated['tenant_id'] = $tenantId;

        $subscription = Subscription::create($validated);

        return $this->success($subscription, 201);
    }

    /**
     * POST /api/v1/subscriptions/{id}/renew
     */
    public function renewSubscription(int $id): JsonResponse
    {
        $subscription = Subscription::findOrFail($id);
        $invoice = $subscription->renew();

        return $this->success(['message' => 'Subscription renewed', 'invoice' => $invoice]);
    }

    /**
     * POST /api/v1/subscriptions/{id}/cancel
     */
    public function cancelSubscription(int $id): JsonResponse
    {
        $subscription = Subscription::findOrFail($id);
        $subscription->cancel();

        return $this->success(['message' => 'Subscription cancelled']);
    }
}
