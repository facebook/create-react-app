<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Marketing\Models\EmailCampaign;
use App\Modules\Marketing\Models\MailingList;
use App\Modules\Marketing\Models\Subscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MarketingApiController extends ApiController
{
    public function campaigns(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $query = EmailCampaign::where('tenant_id', $tenantId);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return $this->paginated($query->latest()->paginate(15));
    }

    public function showCampaign(int $id): JsonResponse
    {
        $campaign = EmailCampaign::with(['mailingList', 'creator'])->findOrFail($id);

        $stats = [
            'total_recipients'  => $campaign->total_recipients,
            'sent_count'        => $campaign->sent_count,
            'open_count'        => $campaign->open_count,
            'click_count'       => $campaign->click_count,
            'bounce_count'      => $campaign->bounce_count,
            'unsubscribe_count' => $campaign->unsubscribe_count,
        ];

        return $this->success(array_merge($campaign->toArray(), ['stats' => $stats]));
    }

    public function storeCampaign(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'subject'        => 'required|string|max:255',
            'preview_text'   => 'nullable|string|max:255',
            'body_html'      => 'nullable|string',
            'body_text'      => 'nullable|string',
            'from_name'      => 'nullable|string|max:255',
            'from_email'     => 'nullable|email|max:255',
            'mailing_list_id'=> 'nullable|integer|exists:mailing_lists,id',
            'status'         => 'nullable|string',
            'scheduled_at'   => 'nullable|date',
        ]);

        $validated['tenant_id']  = $tenantId;
        $validated['created_by'] = $request->user()->id;

        $campaign = EmailCampaign::create($validated);

        return $this->success($campaign, 201);
    }

    public function mailingLists(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $paginator = MailingList::where('tenant_id', $tenantId)
            ->latest()
            ->paginate(15);

        return $this->paginated($paginator);
    }

    public function storeMailingList(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active'   => 'nullable|boolean',
        ]);

        $validated['tenant_id'] = $tenantId;

        $list = MailingList::create($validated);

        return $this->success($list, 201);
    }

    public function subscribers(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $query = Subscriber::where('tenant_id', $tenantId);

        if ($request->filled('mailing_list_id')) {
            $query->whereHas('mailingLists', fn ($q) => $q->where('mailing_lists.id', $request->mailing_list_id));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return $this->paginated($query->latest()->paginate(15));
    }
}
