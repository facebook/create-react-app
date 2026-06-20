<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Finance\Models\Contact;
use App\Services\CreditLimitService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreditLimitController extends ApiController
{
    public function __construct(private CreditLimitService $service) {}

    public function show(Request $request, Contact $contact): JsonResponse
    {
        return $this->success($this->service->getCreditStatus($contact));
    }

    public function update(Request $request, Contact $contact): JsonResponse
    {
        $data = $request->validate([
            'credit_limit'      => ['sometimes', 'numeric', 'min:0'],
            'credit_terms_days' => ['sometimes', 'integer', 'min:0', 'max:365'],
            'credit_hold'       => ['sometimes', 'boolean'],
        ]);

        $contact->update($data);

        return $this->success($this->service->getCreditStatus($contact->fresh()));
    }

    public function check(Request $request, Contact $contact): JsonResponse
    {
        $data = $request->validate([
            'amount' => ['required', 'numeric', 'min:0'],
        ]);

        $would    = $this->service->wouldExceedLimit($contact, $data['amount']);
        $status   = $this->service->getCreditStatus($contact);
        $onHold   = $contact->credit_hold;

        return $this->success([
            'contact_id'       => $contact->id,
            'amount_requested' => $data['amount'],
            'would_exceed'     => $would,
            'on_hold'          => $onHold,
            'approved'         => ! $would && ! $onHold,
            'credit_status'    => $status,
        ]);
    }

    public function alerts(Request $request): JsonResponse
    {
        $tenantId  = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
        $threshold = (float) $request->get('threshold', 80);

        $alerts = $this->service->getContactsNearLimit($tenantId, $threshold);

        return $this->success($alerts);
    }
}
