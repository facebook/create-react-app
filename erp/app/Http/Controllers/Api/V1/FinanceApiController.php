<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Finance\Models\Bill;
use App\Modules\Finance\Models\Contact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FinanceApiController extends ApiController
{
    /**
     * GET /api/v1/finance/bills
     */
    public function index(Request $request): JsonResponse
    {
        $query = Bill::with('contact:id,name');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($contactId = $request->query('contact_id')) {
            $query->where('contact_id', $contactId);
        }

        $paginator = $query->latest()->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * GET /api/v1/finance/bills/{id}
     */
    public function show(int $id): JsonResponse
    {
        $bill = Bill::with(['items', 'contact'])->findOrFail($id);

        return $this->success($bill);
    }

    /**
     * POST /api/v1/finance/bills
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'contact_id' => 'required|integer|exists:contacts,id',
            'issue_date' => 'required|date',
            'due_date'   => 'nullable|date',
            'notes'      => 'nullable|string',
        ]);

        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $validated['tenant_id'] = $tenantId;

        $bill = Bill::create($validated);

        return $this->success($bill, 201);
    }

    /**
     * PUT /api/v1/finance/bills/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $bill = Bill::findOrFail($id);

        $validated = $request->validate([
            'contact_id' => 'nullable|integer|exists:contacts,id',
            'bill_date'  => 'nullable|date',
            'due_date'   => 'nullable|date',
            'notes'      => 'nullable|string',
        ]);

        $bill->update($validated);

        return $this->success($bill);
    }

    /**
     * DELETE /api/v1/finance/bills/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $bill = Bill::findOrFail($id);

        if ($bill->status === 'paid') {
            return $this->error('Cannot delete a paid bill.', 422);
        }

        $bill->delete();

        return $this->success(['message' => 'Bill deleted']);
    }

    /**
     * GET /api/v1/finance/contacts
     */
    public function contacts(Request $request): JsonResponse
    {
        $query = Contact::query();

        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        $paginator = $query->latest()->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * POST /api/v1/finance/contacts
     */
    public function storeContact(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'type'  => 'nullable|string|in:customer,supplier,both',
        ]);

        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $validated['tenant_id'] = $tenantId;

        $contact = Contact::create($validated);

        return $this->success($contact, 201);
    }
}
