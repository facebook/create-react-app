<?php

namespace App\Http\Controllers\Api\V1;

use App\Modules\Events\Models\Event;
use App\Modules\Events\Models\EventRegistration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventsApiController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $query = Event::where('tenant_id', $tenantId);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->where('starts_at', '>=', $request->date_from);
        }

        return $this->paginated($query->orderBy('starts_at')->paginate(15));
    }

    public function show(int $id): JsonResponse
    {
        $event = Event::withCount('registrations')->with('organizer')->findOrFail($id);

        return $this->success($event);
    }

    public function store(Request $request): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $validated = $request->validate([
            'title'        => 'required|string|max:255',
            'description'  => 'nullable|string',
            'location'     => 'nullable|string|max:255',
            'starts_at'    => 'required|date',
            'ends_at'      => 'required|date|after:starts_at',
            'capacity'     => 'nullable|integer|min:1',
            'status'       => 'nullable|string',
            'organizer_id' => 'nullable|integer|exists:users,id',
        ]);

        $validated['tenant_id'] = $tenantId;

        $event = Event::create($validated);

        return $this->success($event, 201);
    }

    public function register(Request $request, int $id): JsonResponse
    {
        $tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;

        $event = Event::findOrFail($id);

        $user = $request->user();

        $registration = EventRegistration::create([
            'event_id'       => $event->id,
            'tenant_id'      => $tenantId,
            'attendee_name'  => $user->name,
            'attendee_email' => $user->email,
            'status'         => 'confirmed',
            'registered_at'  => now(),
        ]);

        return $this->success($registration, 201);
    }
}
