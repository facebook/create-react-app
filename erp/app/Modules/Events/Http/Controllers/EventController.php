<?php

namespace App\Modules\Events\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Events\Models\Event;
use App\Modules\Events\Models\EventRegistration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(): Response
    {
        $events = Event::withCount('registrations')
            ->orderByDesc('starts_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Events/Index', [
            'events' => $events,
        ]);
    }

    public function show(Event $event): Response
    {
        $event->load(['registrations', 'organizer']);

        return Inertia::render('Events/Show', [
            'event' => $event,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title'        => 'required|string|max:255',
            'description'  => 'nullable|string',
            'location'     => 'nullable|string|max:255',
            'starts_at'    => 'required|date',
            'ends_at'      => 'nullable|date',
            'capacity'     => 'nullable|integer|min:1',
            'organizer_id' => 'nullable|exists:users,id',
        ]);

        $event = Event::create([
            ...$validated,
            'tenant_id' => auth()->user()->tenant_id,
            'status'    => 'draft',
        ]);

        return redirect()->route('events.show', $event)->with('success', 'Event created.');
    }

    public function update(Request $request, Event $event): RedirectResponse
    {
        abort_if($event->status !== 'draft', 403, 'Only draft events can be updated.');

        $validated = $request->validate([
            'title'        => 'sometimes|required|string|max:255',
            'description'  => 'nullable|string',
            'location'     => 'nullable|string|max:255',
            'starts_at'    => 'sometimes|required|date',
            'ends_at'      => 'nullable|date',
            'capacity'     => 'nullable|integer|min:1',
            'organizer_id' => 'nullable|exists:users,id',
        ]);

        $event->update($validated);

        return redirect()->route('events.show', $event)->with('success', 'Event updated.');
    }

    public function destroy(Event $event): RedirectResponse
    {
        abort_if(
            ! in_array($event->status, ['draft', 'cancelled']),
            403,
            'Only draft or cancelled events can be deleted.'
        );

        $event->delete();

        return redirect()->route('events.index')->with('success', 'Event deleted.');
    }

    public function publish(Event $event): RedirectResponse
    {
        $event->publish();

        return redirect()->back()->with('success', 'Event published.');
    }

    public function cancel(Event $event): RedirectResponse
    {
        $event->cancel();

        return redirect()->back()->with('success', 'Event cancelled.');
    }

    public function register(Request $request, Event $event): RedirectResponse
    {
        abort_unless($event->isOpen(), 422, 'This event is not open for registration.');

        if ($event->isFull()) {
            abort(422, 'This event is full.');
        }

        $validated = $request->validate([
            'attendee_name'  => 'required|string|max:255',
            'attendee_email' => 'required|email|max:255',
            'notes'          => 'nullable|string',
        ]);

        EventRegistration::create([
            ...$validated,
            'event_id'      => $event->id,
            'tenant_id'     => $event->tenant_id,
            'status'        => 'registered',
            'registered_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Registration successful.');
    }

    public function confirmRegistration(Event $event, EventRegistration $registration): RedirectResponse
    {
        abort_if($registration->event_id !== $event->id, 404);

        $registration->confirm();

        return redirect()->back()->with('success', 'Registration confirmed.');
    }

    public function markAttended(Event $event, EventRegistration $registration): RedirectResponse
    {
        abort_if($registration->event_id !== $event->id, 404);

        $registration->markAttended();

        return redirect()->back()->with('success', 'Marked as attended.');
    }

    public function cancelRegistration(Event $event, EventRegistration $registration): RedirectResponse
    {
        abort_if($registration->event_id !== $event->id, 404);

        $registration->cancel();

        return redirect()->back()->with('success', 'Registration cancelled.');
    }
}
