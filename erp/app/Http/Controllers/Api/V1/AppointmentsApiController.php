<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Appointments\Models\Appointment;
use App\Modules\Appointments\Models\AppointmentSlot;
use App\Modules\Appointments\Models\AppointmentType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppointmentsApiController extends ApiController
{
    /**
     * GET /api/v1/appointments/types
     */
    public function types(Request $request): JsonResponse
    {
        $query = AppointmentType::query();

        if ($request->boolean('active')) {
            $query->where('is_active', true);
        }

        $paginator = $query->latest()->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * GET /api/v1/appointments/slots
     */
    public function slots(Request $request): JsonResponse
    {
        $query = AppointmentSlot::with(['type:id,name']);

        if ($typeId = $request->query('appointment_type_id')) {
            $query->where('appointment_type_id', $typeId);
        }

        if ($date = $request->query('date')) {
            $query->whereDate('start_at', $date);
        }

        $paginator = $query->orderBy('start_at')->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * GET /api/v1/appointments
     */
    public function appointments(Request $request): JsonResponse
    {
        $query = Appointment::with(['type:id,name']);

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $paginator = $query->latest()->paginate(20);

        return $this->paginated($paginator);
    }

    /**
     * GET /api/v1/appointments/{id}
     */
    public function showAppointment(int $id): JsonResponse
    {
        $appointment = Appointment::with('type')->findOrFail($id);

        return $this->success($appointment);
    }

    /**
     * POST /api/v1/appointments
     */
    public function storeAppointment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'appointment_slot_id'  => 'required|integer',
            'appointment_type_id'  => 'required|integer',
            'customer_name'        => 'required|string|max:255',
            'customer_email'       => 'nullable|email|max:255',
            'customer_phone'       => 'nullable|string|max:50',
            'notes'                => 'nullable|string',
            'status'               => 'nullable|string|max:50',
        ]);

        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $appointment = Appointment::create(array_merge($validated, [
            'tenant_id' => $tenantId,
            'status'    => $validated['status'] ?? 'pending',
        ]));

        return $this->success($appointment->load('type'), 201);
    }

    /**
     * POST /api/v1/appointments/{id}/cancel
     */
    public function cancelAppointment(int $id): JsonResponse
    {
        $appointment = Appointment::findOrFail($id);

        $appointment->update([
            'status'       => 'cancelled',
            'cancelled_at' => now(),
        ]);

        return $this->success($appointment->fresh());
    }
}
