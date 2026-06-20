<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Finance\Models\Contact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerApiController extends ApiController
{
    /**
     * GET /api/v1/customers
     */
    public function index(Request $request): JsonResponse
    {
        $query = Contact::customers();

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $paginator = $query->latest()->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * GET /api/v1/customers/{id}
     */
    public function show(int $id): JsonResponse
    {
        $customer = Contact::customers()->with([
            'invoices' => fn ($q) => $q->select('id', 'contact_id', 'number', 'status', 'issue_date', 'due_date')->latest()->limit(10),
        ])->findOrFail($id);

        return $this->success($customer);
    }

    /**
     * POST /api/v1/customers
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'    => 'required|string|max:255',
            'email'   => 'nullable|email|max:255',
            'phone'   => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'notes'   => 'nullable|string',
        ]);

        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $validated['tenant_id'] = $tenantId;
        $validated['type']      = 'customer';
        $validated['is_active'] = true;

        $customer = Contact::create($validated);

        return $this->success($customer, 201);
    }

    /**
     * PUT /api/v1/customers/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $customer = Contact::customers()->findOrFail($id);

        $validated = $request->validate([
            'name'    => 'sometimes|string|max:255',
            'email'   => 'nullable|email|max:255',
            'phone'   => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'notes'   => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $customer->update($validated);

        return $this->success($customer);
    }

    /**
     * DELETE /api/v1/customers/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $customer = Contact::customers()->findOrFail($id);
        $customer->delete();

        return $this->success(['message' => 'Customer deleted']);
    }
}
