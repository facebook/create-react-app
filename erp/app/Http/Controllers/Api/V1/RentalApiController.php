<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Rental\Models\RentalAgreement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RentalApiController extends ApiController
{
    /**
     * GET /api/v1/rental
     */
    public function index(Request $request): JsonResponse
    {
        $query = RentalAgreement::with(['item:id,name,category,daily_rate']);

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $paginator = $query->latest()->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * GET /api/v1/rental/{id}
     */
    public function show(int $id): JsonResponse
    {
        $agreement = RentalAgreement::with('item')->findOrFail($id);

        return $this->success($agreement);
    }

    /**
     * POST /api/v1/rental
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'rental_item_id'  => 'required|integer',
            'customer_name'   => 'required|string|max:255',
            'customer_email'  => 'nullable|email|max:255',
            'start_date'      => 'required|date',
            'end_date'        => 'nullable|date|after_or_equal:start_date',
            'daily_rate'      => 'required|numeric|min:0',
            'deposit'         => 'nullable|numeric|min:0',
            'status'          => 'nullable|string|max:50',
            'notes'           => 'nullable|string',
        ]);

        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $agreement = RentalAgreement::create(array_merge($validated, [
            'tenant_id' => $tenantId,
            'status'    => $validated['status'] ?? 'pending',
        ]));

        return $this->success($agreement->load('item'), 201);
    }

    /**
     * PUT /api/v1/rental/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $agreement = RentalAgreement::findOrFail($id);

        $validated = $request->validate([
            'rental_item_id'  => 'sometimes|integer',
            'customer_name'   => 'sometimes|string|max:255',
            'customer_email'  => 'nullable|email|max:255',
            'start_date'      => 'sometimes|date',
            'end_date'        => 'nullable|date',
            'daily_rate'      => 'sometimes|numeric|min:0',
            'deposit'         => 'nullable|numeric|min:0',
            'status'          => 'nullable|string|max:50',
            'notes'           => 'nullable|string',
            'returned_at'     => 'nullable|date',
        ]);

        $agreement->update($validated);

        return $this->success($agreement->fresh()->load('item'));
    }

    /**
     * DELETE /api/v1/rental/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $agreement = RentalAgreement::findOrFail($id);
        $agreement->delete();

        return $this->success(['message' => 'Rental agreement deleted.']);
    }
}
