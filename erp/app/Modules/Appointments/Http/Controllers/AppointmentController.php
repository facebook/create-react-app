<?php

namespace App\Modules\Appointments\Http\Controllers;

use App\Modules\Appointments\Models\Appointment;
use App\Modules\Appointments\Models\AppointmentSlot;
use App\Modules\Appointments\Models\AppointmentType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Inertia\Inertia;
use Inertia\Response;

class AppointmentController extends Controller
{
    public function dashboard(): Response
    {
        $today = today();
        $nextWeek = today()->addDays(7);

        $stats = [
            'today_count'    => Appointment::whereDate('created_at', $today)->count(),
            'pending_count'  => Appointment::where('status', 'pending')->count(),
            'confirmed_count' => Appointment::where('status', 'confirmed')->count(),
            'upcoming_week'  => AppointmentSlot::whereBetween('start_at', [$today, $nextWeek])->count(),
        ];

        return Inertia::render('Appointments/Dashboard', [
            'stats' => $stats,
        ]);
    }

    public function types(): Response
    {
        $types = AppointmentType::orderBy('name')->paginate(20);

        return Inertia::render('Appointments/Types/Index', [
            'types' => $types,
        ]);
    }

    public function storeType(Request $request): RedirectResponse
    {
        $request->validate([
            'name'             => 'required|string|max:255',
            'description'      => 'nullable|string',
            'duration_minutes' => 'nullable|integer|min:15',
            'location'         => 'nullable|string|max:255',
            'max_capacity'     => 'nullable|integer|min:1',
            'is_active'        => 'nullable|boolean',
            'color'            => 'nullable|string|max:50',
        ]);

        AppointmentType::create([
            'tenant_id'        => auth()->user()->tenant_id,
            'name'             => $request->name,
            'description'      => $request->description,
            'duration_minutes' => $request->input('duration_minutes', 60),
            'location'         => $request->location,
            'max_capacity'     => $request->input('max_capacity', 1),
            'is_active'        => $request->input('is_active', true),
            'color'            => $request->color,
        ]);

        return redirect()->back()->with('success', 'Appointment type created.');
    }

    public function slots(): Response
    {
        $slots = AppointmentSlot::with('type')
            ->orderBy('start_at')
            ->paginate(20);

        return Inertia::render('Appointments/Slots/Index', [
            'slots' => $slots,
            'types' => AppointmentType::where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function storeSlot(Request $request): RedirectResponse
    {
        $request->validate([
            'appointment_type_id' => 'required|exists:appointment_types,id',
            'start_at'            => 'required|date',
            'end_at'              => 'required|date|after:start_at',
            'capacity'            => 'nullable|integer|min:1',
            'staff_user_id'       => 'nullable|exists:users,id',
            'is_available'        => 'nullable|boolean',
        ]);

        AppointmentSlot::create([
            'tenant_id'           => auth()->user()->tenant_id,
            'appointment_type_id' => $request->appointment_type_id,
            'start_at'            => $request->start_at,
            'end_at'              => $request->end_at,
            'capacity'            => $request->input('capacity', 1),
            'staff_user_id'       => $request->staff_user_id,
            'is_available'        => $request->input('is_available', true),
        ]);

        return redirect()->back()->with('success', 'Appointment slot created.');
    }

    public function index(): Response
    {
        $appointments = Appointment::with(['slot.type'])
            ->orderByDesc('created_at')
            ->paginate(20);

        return Inertia::render('Appointments/Index', [
            'appointments' => $appointments,
            'slots'        => AppointmentSlot::with('type')->where('is_available', true)->orderBy('start_at')->get(),
            'types'        => AppointmentType::where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function book(Request $request): JsonResponse
    {
        $request->validate([
            'appointment_slot_id' => 'required|exists:appointment_slots,id',
            'appointment_type_id' => 'required|exists:appointment_types,id',
            'customer_name'       => 'required|string|max:255',
            'customer_email'      => 'required|email|max:255',
            'customer_phone'      => 'nullable|string|max:50',
            'notes'               => 'nullable|string',
        ]);

        $slot = AppointmentSlot::findOrFail($request->appointment_slot_id);

        if ($slot->isFull()) {
            return response()->json(['message' => 'This slot is fully booked.'], 422);
        }

        $appointment = Appointment::create([
            'tenant_id'           => auth()->user()->tenant_id,
            'appointment_slot_id' => $request->appointment_slot_id,
            'appointment_type_id' => $request->appointment_type_id,
            'customer_name'       => $request->customer_name,
            'customer_email'      => $request->customer_email,
            'customer_phone'      => $request->customer_phone,
            'notes'               => $request->notes,
            'status'              => 'pending',
        ]);

        $slot->increment('booked_count');

        return response()->json([
            'success'        => true,
            'appointment_id' => $appointment->id,
        ]);
    }

    public function confirm(Appointment $appointment): JsonResponse
    {
        $appointment->confirm();

        return response()->json(['success' => true]);
    }

    public function cancel(Request $request, Appointment $appointment): JsonResponse
    {
        $request->validate([
            'cancellation_reason' => 'nullable|string',
        ]);

        $appointment->cancel($request->input('cancellation_reason', ''));

        return response()->json(['success' => true]);
    }

    public function complete(Appointment $appointment): JsonResponse
    {
        $appointment->complete();

        return response()->json(['success' => true]);
    }
}
