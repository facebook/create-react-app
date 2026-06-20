<?php

namespace App\Modules\HR\Http\Controllers;

use App\Modules\HR\Models\TrainingSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TrainingSessionController
{
    public function index(): Response
    {
        $sessions = TrainingSession::with('course')
            ->orderByDesc('scheduled_at')
            ->paginate(20);

        return Inertia::render('HR/TrainingSessions/Index', compact('sessions'));
    }

    public function create(): Response
    {
        return Inertia::render('HR/TrainingSessions/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'training_course_id' => 'required|exists:training_courses,id',
            'title'              => 'required|string|max:255',
            'scheduled_at'       => 'required|date',
            'ends_at'            => 'nullable|date|after:scheduled_at',
            'description'        => 'nullable|string',
            'location'           => 'nullable|string|max:255',
            'delivery_mode'      => 'nullable|string|in:in-person,online,hybrid',
            'max_participants'   => 'nullable|integer|min:1',
            'facilitator_id'     => 'nullable|exists:users,id',
        ]);

        $data['tenant_id']  = app('tenant')->id;
        $data['created_by'] = auth()->id();

        TrainingSession::create($data);

        return redirect()->route('hr.training-sessions.index');
    }

    public function show(TrainingSession $trainingSession): Response
    {
        $trainingSession->load('course', 'facilitator');
        return Inertia::render('HR/TrainingSessions/Show', ['session' => $trainingSession]);
    }

    public function edit(TrainingSession $trainingSession): Response
    {
        return Inertia::render('HR/TrainingSessions/Edit', ['session' => $trainingSession]);
    }

    public function update(Request $request, TrainingSession $trainingSession): RedirectResponse
    {
        $data = $request->validate([
            'title'            => 'required|string|max:255',
            'scheduled_at'     => 'required|date',
            'ends_at'          => 'nullable|date|after:scheduled_at',
            'description'      => 'nullable|string',
            'location'         => 'nullable|string|max:255',
            'delivery_mode'    => 'nullable|string|in:in-person,online,hybrid',
            'max_participants' => 'nullable|integer|min:1',
            'facilitator_id'   => 'nullable|exists:users,id',
        ]);

        $trainingSession->update($data);

        return redirect()->route('hr.training-sessions.index');
    }

    public function destroy(TrainingSession $trainingSession): RedirectResponse
    {
        $trainingSession->delete();
        return redirect()->route('hr.training-sessions.index');
    }

    public function start(TrainingSession $trainingSession): RedirectResponse
    {
        $trainingSession->start();
        return redirect()->route('hr.training-sessions.index');
    }

    public function complete(TrainingSession $trainingSession): RedirectResponse
    {
        $trainingSession->complete();
        return redirect()->route('hr.training-sessions.index');
    }

    public function cancel(TrainingSession $trainingSession): RedirectResponse
    {
        $trainingSession->cancel();
        return redirect()->route('hr.training-sessions.index');
    }
}
